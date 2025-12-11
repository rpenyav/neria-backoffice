export interface Conversation {
  id: string;
  title: string;
  channel: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateConversationPayload {
  title: string;
  channel: string; // p.ej. "widget-web", "admin-panel"
}

export interface UpdateConversationPayload {
  title?: string;
  channel?: string;
}

export interface ChatAttachment {
  url: string;
  provider: string; // "cloudinary" | "aws-s3" | ...
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ChatMessagePayload {
  conversationId?: string; // opcional si hay sesiones anónimas
  message: string;
  attachments?: ChatAttachment[];
}
