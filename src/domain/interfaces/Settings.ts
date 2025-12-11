export type SettingScope = "global" | string; // "dev-app", "prod-app", etc.

export interface Setting {
  id: string;
  key: string; // p.ej. "prompt.system"
  scope: SettingScope;
  value: string; // texto del prompt u otro valor
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSettingPayload {
  key: string;
  scope: SettingScope;
  value: string;
}

export interface UpdateSettingPayload {
  value: string;
}
