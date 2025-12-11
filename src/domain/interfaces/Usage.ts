export interface Usage {
  id: string;
  provider: string;
  model: string;
  userId: string | null;
  conversationId: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  createdAt: string;
}

/**
 * Si ya tienes PagedResponse definido en otro sitio (por ejemplo en Product),
 * puedes reutilizarlo y NO necesitas esta interfaz.
 *
 * Si no lo tienes, descomenta esto y úsalo.
 */
// export interface PagedResponse<T> {
//   pageSize: number;
//   pageNumber: number;
//   totalRegisters: number;
//   list: T[];
// }

// src/domain/interfaces/Usage.ts

// Resumen global para el bloque "Resumen de actividad"
export interface GlobalUsageSummary {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  // opcional: periodo, etc.
  period?: string;
}

// Ejemplo de uso diario (para futuros gráficos)
export interface DailyUsage {
  date: string; // ISO string o "YYYY-MM-DD"
  conversations: number;
  messages: number;
  tokens: number;
}

// Ejemplo de KPI por usuario
export interface UsageByUser {
  userId: string;
  email?: string;
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
}

// Ejemplo de KPI por conversación (detalle)
export interface UsageByConversation {
  conversationId: string;
  totalMessages: number;
  totalTokens: number;
}

// Si tu backend devuelve algo distinto, ajusta estos tipos
// o crea un tipo más genérico (any / Record<string, unknown>).
