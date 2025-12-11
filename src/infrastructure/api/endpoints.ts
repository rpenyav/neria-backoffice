const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const ENDPOINTS = {
  auth: {
    login: `${BASE}/auth/login`,
    anonymousSession: `${BASE}/auth/anonymous-session`,
  },
  users: {
    base: `${BASE}/users`,
    meInfo: `${BASE}/users/me/info`,
    byId: (id: string) => `${BASE}/users/${id}`,
  },
  chat: {
    message: `${BASE}/chat/message`,
  },
  conversations: {
    base: `${BASE}/conversations`,
    byId: (id: string) => `${BASE}/conversations/${id}`,
  },
  uploads: {
    single: `${BASE}/uploads`,
    multiple: `${BASE}/uploads/multiple`,
  },
  settings: {
    base: `${BASE}/settings`,
    byId: (id: string) => `${BASE}/settings/${id}`,
  },
  usage: {
    base: `${BASE}/usage`,
    byUser: (userId: string) => `${BASE}/usage/by-user/${userId}`,
    byConversation: (conversationId: string) =>
      `${BASE}/usage/by-conversation/${conversationId}`,
  },
  categories: {
    base: `${BASE}/categories`,
    paginated: (page: number, pageSize: number) =>
      `${BASE}/categories?page=${page}&pageSize=${pageSize}`,
    byId: (id: number | string) => `${BASE}/categories/${id}`,
  },
  products: {
    base: `${BASE}/products`,
    byId: (id: string) => `${BASE}/products/${id}`,
    bySlug: (slug: string) => `${BASE}/products/slug/${slug}`,
  },
  contact: {
    base: `${BASE}/contact`,
  },
} as const;
