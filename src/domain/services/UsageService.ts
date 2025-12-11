// src/domain/services/UsageService.ts
import type {
  GlobalUsageSummary,
  UsageByUser,
  UsageByConversation,
  DailyUsage,
} from "../interfaces/Usage";
import { UsageRepository } from "../../infrastructure/repositories/UsageRepository";
import type { HttpClient } from "../../infrastructure/api/httpClient";

export class UsageService {
  private readonly repo: UsageRepository;

  constructor(httpClient: HttpClient) {
    this.repo = new UsageRepository(httpClient);
  }

  async getDashboardOverview(): Promise<{
    summary: GlobalUsageSummary;
    daily?: DailyUsage[];
  }> {
    // Aquí podrías transformar datos, rellenar defaults, etc.
    return this.repo.getGlobalUsage();
  }

  async getUsageByUser(userId: string): Promise<UsageByUser> {
    return this.repo.getUsageByUser(userId);
  }

  async getUsageByConversation(
    conversationId: string
  ): Promise<UsageByConversation> {
    return this.repo.getUsageByConversation(conversationId);
  }
}
