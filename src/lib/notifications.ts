import { prisma } from "./prisma";

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({ data: params });
}

export async function notifyArticleStatusChange(
  articleId: string,
  articleTitle: string,
  newStatus: string,
  targetUserId: string,
  reviewNote?: string,
) {
  const typeMap: Record<string, { title: string; message: string }> = {
    IN_REVIEW: {
      title: "Artikel Diajukan untuk Review",
      message: `Artikel "${articleTitle}" telah diajukan untuk direview.`,
    },
    APPROVED: {
      title: "Artikel Disetujui",
      message: `Artikel "${articleTitle}" telah disetujui oleh editor.`,
    },
    REJECTED: {
      title: "Artikel Ditolak",
      message: `Artikel "${articleTitle}" ditolak. ${reviewNote ? `Catatan: ${reviewNote}` : ""}`,
    },
    PUBLISHED: {
      title: "Artikel Dipublikasikan",
      message: `Artikel "${articleTitle}" telah dipublikasikan.`,
    },
  };

  // Suppress unused variable warning
  void articleId;

  const info = typeMap[newStatus];
  if (!info) return;

  return createNotification({
    userId: targetUserId,
    type: `article_${newStatus.toLowerCase()}`,
    title: info.title,
    message: info.message,
    link: `/panel/artikel`,
  });
}
