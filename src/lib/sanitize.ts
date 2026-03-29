// Input sanitization utilities

// Remove potentially dangerous HTML tags (script, iframe, object, embed, form)
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove inline event handlers
    .replace(/javascript\s*:/gi, "") // Remove javascript: URLs
    .replace(/data\s*:\s*text\/html/gi, ""); // Remove data:text/html
}

// Sanitize plain text input (no HTML allowed)
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim();
}

// Validate and sanitize email
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Sanitize slug
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}
