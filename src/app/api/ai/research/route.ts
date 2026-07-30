/**
 * POST /api/ai/research
 * Body: {
 *   topic: string,
 *   mode?: "draft" | "research",
 *   notes?: string,
 *   persona?: string,
 *   includeImages?: boolean,
 *   recency?: "week" | "month" | "year" | "all",
 *   provider?: "qwen" | "perplexity" | "auto",
 *   qwenModel?: string
 * }
 *
 * Researches a news topic on the live web using Qwen AI (or Perplexity) and returns:
 *   - mode "draft" (default): a ready-to-edit article in HTML (<p>/<h2>/<blockquote>/<ul>)
 *   - mode "research": a sourced briefing (facts + angles) to write from
 * plus real web sources.
 *
 * Auth: writers+ (same roles allowed to create articles).
 */

import { NextRequest } from "next/server";
import { requireAuth, successResponse, errorResponse, ApiError, logAudit } from "@/lib/api-utils";
import { aiRateLimit } from "@/lib/rate-limit";
import { callPerplexity, getPerplexityInstructions } from "@/lib/perplexity";
import { callQwen, getPrimaryProvider } from "@/lib/ai-client";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto-secrets";
import { shouldOffloadSmallFields, deriveSmallFieldsViaDeepSeek } from "@/lib/ai-small-fields";
import { getPersonaInstruction } from "@/lib/perplexity-personas";
import { localizePerplexityImages } from "@/lib/perplexity-images";

// Indonesian outlets to bias sourcing toward
const ID_OUTLETS = [
  "kompas.com", "detik.com", "tempo.co", "antaranews.com", "cnnindonesia.com",
  "tribunnews.com", "liputan6.com", "kontan.co.id", "bisnis.com", "republika.co.id",
  "suara.com", "merdeka.com", "jpnn.com", "pikiran-rakyat.com",
];

const SYSTEM_DRAFT =
  "Anda jurnalis senior Kartawarta — media berita digital Bandung (fokus bisnis, ekonomi, " +
  "pemerintahan, hukum, plus topik general). Riset topik dari sumber berita Indonesia yang " +
  "kredibel dan TERBARU, lalu hasilkan PAKET artikel lengkap berbahasa Indonesia yang faktual " +
  "dan SEO-friendly. JANGAN mengarang fakta — hanya yang didukung sumber. " +
  "DILARANG KERAS menyertakan kalimat/pernyataan/disclaimer bahwa artikel dibuat atau ditulis ulang oleh AI. " +
  "Jawab PERSIS dengan format blok berpenanda di bawah ini (JANGAN pakai JSON, markdown, atau code fence). " +
  "Tulis setiap penanda di barisnya sendiri, lalu isinya di bawahnya:\n" +
  "===JUDUL===\n(judul artikel menarik, maks 110 karakter)\n" +
  "===RINGKASAN===\n(ringkasan 1-2 kalimat, maks 200 karakter)\n" +
  "===TAGS===\n(5-8 tag relevan dipisah koma)\n" +
  "===SEO_TITLE===\n(judul SEO, maks 60 karakter)\n" +
  "===META===\n(meta description, maks 155 karakter)\n" +
  "===KONTEN===\n(isi artikel sebagai HTML rich-text: <p> paragraf, <h2>/<h3> sub-judul, " +
  "<blockquote> kutipan, <ul>/<li> poin; tanpa tag <html>/<body>, tanpa daftar sumber di akhir)\n" +
  "Jangan menulis apa pun sebelum ===JUDUL=== atau sesudah konten. " +
  "Jangan sertakan penanda sitasi [1][2] di dalam teks.";

const SYSTEM_RESEARCH =
  "Anda periset berita untuk Kartawarta. Riset topik dari sumber Indonesia yang kredibel dan " +
  "terbaru, lalu rangkum sebagai bahan tulis: fakta kunci (apa/siapa/kapan/di mana/mengapa), " +
  "angka/kutipan penting, konteks, dan beberapa angle menarik. Bahasa Indonesia, ringkas, " +
  "berbasis fakta. Output HTML rich-text (<h2>/<p>/<ul>/<li>). Tanpa markdown/code fence.";

async function getQwenKey(): Promise<string | null> {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: "qwen_api_key" } });
    if (row?.value && row.value.trim().length > 0) {
      try {
        return decryptSecret(row.value.trim());
      } catch {
        return row.value.trim();
      }
    }
  } catch {
    // fall through
  }
  return process.env.QWEN_API_KEY || null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const { success: allowed } = aiRateLimit(session.user.id);
    if (!allowed) {
      throw new ApiError("Batas penggunaan AI tercapai (20 request/jam). Coba lagi nanti.", 429);
    }

    const body = await req.json().catch(() => ({}));
    const topic = (body.topic ?? "").toString().trim().slice(0, 500);
    const mode = body.mode === "research" ? "research" : "draft";
    const notes = (body.notes ?? "").toString().trim().slice(0, 2000);
    const personaKey = (body.persona ?? "").toString().trim();
    const includeImages = body.includeImages === true;
    const requestedProvider = (body.provider ?? "auto").toString().trim().toLowerCase();
    const qwenModelOverride = (body.qwenModel ?? "").toString().trim();

    const recencyRaw = (body.recency ?? "").toString().trim();
    const recency: "week" | "month" | "year" | undefined =
      recencyRaw === "week" || recencyRaw === "month" || recencyRaw === "year"
        ? recencyRaw
        : recencyRaw === "all"
          ? undefined
          : "month";
    if (!topic) throw new ApiError("Topik/judul wajib diisi", 400);

    // Determine target provider
    let provider: "qwen" | "perplexity" = "qwen";
    const qwenKey = await getQwenKey();

    if (requestedProvider === "qwen") {
      provider = "qwen";
    } else if (requestedProvider === "perplexity") {
      provider = "perplexity";
    } else {
      // Auto: prefer Qwen if key is set or if primary provider is Qwen
      const primary = await getPrimaryProvider();
      if (qwenKey || primary === "qwen") {
        provider = "qwen";
      } else {
        provider = "perplexity";
      }
    }

    const userPrompt =
      mode === "draft"
        ? `Topik artikel: ${topic}.${notes ? ` Arahan tambahan: ${notes}.` : ""} ` +
          `Hasilkan paket artikel lengkap PERSIS sesuai format penanda (===JUDUL===, ===RINGKASAN===, ===TAGS===, ===SEO_TITLE===, ===META===, ===KONTEN===) berdasarkan informasi terbaru. Jangan pakai JSON.`
        : `Topik: ${topic}.${notes ? ` Fokus: ${notes}.` : ""} ` +
          `Kumpulkan bahan riset berita terbaru tentang topik ini.`;

    const customInstructions = await getPerplexityInstructions();
    const personaInstruction = getPersonaInstruction(personaKey);
    const baseSystem = mode === "draft" ? SYSTEM_DRAFT : SYSTEM_RESEARCH;
    let systemPrompt = baseSystem;
    if (personaInstruction) systemPrompt += `\n\nGAYA PENULISAN: ${personaInstruction}`;
    if (customInstructions) systemPrompt += `\n\nARAHAN PENULIS (WAJIB DIIKUTI): ${customInstructions}`;

    let cleanedText = "";
    let sources: Array<{ title: string | null; url: string; date: string | null }> = [];
    let relatedQuestions: string[] = [];
    let rawImages: Array<{ imageUrl: string; originUrl: string | null; title: string | null; width: number | null; height: number | null }> = [];
    let usedModel = "";

    if (provider === "qwen") {
      if (!qwenKey) {
        throw new ApiError("API Key Qwen belum dikonfigurasi. Tambahkan di Pengaturan → AI.", 400);
      }

      usedModel = qwenModelOverride || "qwen-max";

      try {
        const qwenRes = await callQwen(
          {
            feature: mode === "draft" ? "article_draft" : "article_draft",
            systemPrompt,
            userPrompt,
            enableSearch: true,
            modelOverride: usedModel,
            maxTokens: mode === "draft" ? 4500 : 1400,
            userId: session.user.id,
            articleTitle: topic,
          },
          qwenKey,
        );

        cleanedText = qwenRes.text;
        sources = qwenRes.sources || [];
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Qwen error";
        console.error("Qwen research failed:", err);
        throw new ApiError(`Riset Qwen gagal: ${msg}`, 502);
      }
    } else {
      // Perplexity path
      usedModel = "sonar";
      try {
        const result = await callPerplexity({
          systemPrompt,
          userPrompt,
          recency,
          domains: ID_OUTLETS,
          contextSize: "high",
          maxTokens: mode === "draft" ? 5000 : 1400,
          includeImages,
          allowCombo: mode === "draft",
          usageMeta: {
            userId: session.user.id,
            userName: session.user.name || "user",
            feature: mode === "draft" ? "perplexity_draft" : "perplexity_research",
            articleTitle: topic,
          },
        });

        cleanedText = result.text;
        sources = result.sources;
        relatedQuestions = result.related;
        rawImages = result.images;
        usedModel = result.model;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Perplexity error";
        if (msg === "PERPLEXITY_NOT_CONFIGURED") {
          throw new ApiError(
            "API Key Perplexity belum dikonfigurasi. Tambahkan di Pengaturan → AI.",
            400,
          );
        }
        console.error("callPerplexity failed:", err);
        throw new ApiError(msg, 502);
      }
    }

    // Strip citation markers & code fences
    const cleaned = cleanedText
      .replace(/\[\d+\]/g, "")
      .replace(/^```(?:json|html)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const images = includeImages && rawImages.length > 0 ? await localizePerplexityImages(rawImages, 3) : [];

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined;
    await logAudit(
      session.user.id,
      "AI_RESEARCH",
      "Article",
      provider,
      JSON.stringify({ mode, topic, model: usedModel, sources: sources.length, images: images.length }),
      ip,
    );

    if (mode === "draft") {
      const section = (marker: string): string => {
        const re = new RegExp(
          `===${marker}===\\s*\\n?([\\s\\S]*?)(?=\\n?===(?:JUDUL|RINGKASAN|TAGS|SEO_TITLE|META|KONTEN)===|$)`,
          "i",
        );
        const m = cleaned.match(re);
        return m ? m[1].trim() : "";
      };

      const title = section("JUDUL");
      const content = section("KONTEN");
      const hasMarkers = /===KONTEN===/i.test(cleaned) || /===JUDUL===/i.test(cleaned);
      const finalContent = content || (hasMarkers ? "" : cleaned);

      let excerpt = section("RINGKASAN");
      let tags = section("TAGS").replace(/^\[|\]$/g, "").replace(/"/g, "").trim();
      let seoTitle = section("SEO_TITLE");
      let metaDescription = section("META");

      if (finalContent && (await shouldOffloadSmallFields())) {
        const sf = await deriveSmallFieldsViaDeepSeek(title, finalContent, session.user.id);
        if (sf) {
          excerpt = sf.excerpt || excerpt;
          if (sf.tags.length) tags = sf.tags.join(", ");
          seoTitle = sf.seoTitle || seoTitle;
          metaDescription = sf.metaDescription || metaDescription;
        }
      }

      return successResponse({
        mode: "draft",
        fields: { title, excerpt, tags, seoTitle, metaDescription, content: finalContent },
        sources,
        related: relatedQuestions,
        images,
        provider,
        model: usedModel,
      });
    }

    return successResponse({
      mode: "research",
      content: cleaned,
      sources,
      related: relatedQuestions,
      images,
      provider,
      model: usedModel,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
