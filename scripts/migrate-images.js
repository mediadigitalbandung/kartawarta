/**
 * Migrate featured images from WordPress to Prisma articles
 * Maps WP post_id → attachment_id → image URL → update article.featuredImage
 */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SQL_FILE = path.join(__dirname, "..", "db", "afhntwic_wp317.sql");

function parseSqlValues(sql, tableName) {
  const rows = [];
  const regex = new RegExp(
    `INSERT INTO \`${tableName}\`[^)]+\\)\\s+VALUES\\s*([\\s\\S]*?)(?=;\\s*(?:INSERT|DROP|CREATE|ALTER|--|$))`,
    "gi"
  );

  let match;
  while ((match = regex.exec(sql)) !== null) {
    const valuesStr = match[1];
    let depth = 0;
    let current = "";
    let inString = false;
    let escape = false;

    for (let i = 0; i < valuesStr.length; i++) {
      const ch = valuesStr[i];
      if (escape) { current += ch; escape = false; continue; }
      if (ch === "\\") { current += ch; escape = true; continue; }
      if (ch === "'" && !escape) { inString = !inString; current += ch; continue; }
      if (!inString) {
        if (ch === "(") { depth++; if (depth === 1) { current = ""; continue; } }
        else if (ch === ")") { depth--; if (depth === 0) { rows.push(current); current = ""; continue; } }
      }
      current += ch;
    }
  }
  return rows;
}

function parseRow(rowStr) {
  const values = [];
  let current = "";
  let inString = false;
  let escape = false;

  for (let i = 0; i < rowStr.length; i++) {
    const ch = rowStr[i];
    if (escape) { current += ch; escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; current += ch; continue; }
    if (ch === "'") { inString = !inString; continue; }
    if (ch === "," && !inString) { values.push(current.trim()); current = ""; continue; }
    current += ch;
  }
  values.push(current.trim());
  return values;
}

async function main() {
  console.log("Reading SQL dump...");
  const sql = fs.readFileSync(SQL_FILE, "utf-8");

  // 1. Parse attachments (post_type = 'attachment') → get ID → URL mapping
  console.log("Parsing attachments...");
  const postRows = parseSqlValues(sql, "wpqn_posts");
  const attachments = {}; // attachment_id → image_url
  const postSlugs = {};   // post_id → slug

  for (const row of postRows) {
    const vals = parseRow(row);
    const id = vals[0];
    const postType = vals[20];
    const slug = vals[11];
    const guid = vals[18]; // URL

    if (postType === "attachment") {
      attachments[id] = guid;
    }
    if (postType === "post") {
      postSlugs[id] = slug;
    }
  }
  console.log(`  Found ${Object.keys(attachments).length} attachments`);
  console.log(`  Found ${Object.keys(postSlugs).length} post slugs`);

  // 2. Parse postmeta for _thumbnail_id → maps post_id → attachment_id
  console.log("Parsing featured image metadata...");
  const metaRows = parseSqlValues(sql, "wpqn_postmeta");
  const thumbnailMap = {}; // post_id → attachment_id

  for (const row of metaRows) {
    const vals = parseRow(row);
    const postId = vals[1];
    const metaKey = vals[2];
    const metaValue = vals[3];

    if (metaKey === "_thumbnail_id") {
      thumbnailMap[postId] = metaValue;
    }
  }
  console.log(`  Found ${Object.keys(thumbnailMap).length} posts with featured images`);

  // 3. Build post_slug → image_url mapping
  const slugToImage = {};
  for (const [postId, attachmentId] of Object.entries(thumbnailMap)) {
    const slug = postSlugs[postId];
    const imageUrl = attachments[attachmentId];
    if (slug && imageUrl) {
      slugToImage[slug] = imageUrl;
    }
  }
  console.log(`  Mapped ${Object.keys(slugToImage).length} slugs to images`);

  // 4. Update articles in database
  console.log("\nUpdating articles with featured images...");
  let updated = 0;
  let notFound = 0;

  for (const [slug, imageUrl] of Object.entries(slugToImage)) {
    try {
      const article = await prisma.article.findFirst({
        where: {
          OR: [
            { slug: slug },
            { slug: { startsWith: slug } },
          ],
        },
      });

      if (article) {
        await prisma.article.update({
          where: { id: article.id },
          data: { featuredImage: imageUrl },
        });
        updated++;
        process.stdout.write(`\r  Updated: ${updated}`);
      } else {
        notFound++;
      }
    } catch (err) {
      console.error(`\n  Error for slug "${slug}": ${err.message}`);
    }
  }

  console.log(`\n\nImage migration complete!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Not found in DB: ${notFound}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Image migration failed:", err);
  process.exit(1);
});
