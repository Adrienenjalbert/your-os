import type { DraftedBrief, StrapiClient } from "./brief-drafter.js";

export class MockStrapiClient implements StrapiClient {
  public created: Array<{ id: number; data: DraftedBrief["data"] }> = [];
  public updates: Array<{ id: number | string; data: Record<string, unknown> }> = [];
  private nextId = 1;

  async createOpportunityBrief(data: DraftedBrief["data"]) {
    const id = this.nextId++;
    this.created.push({ id, data });
    return { id, slug: `${id}-${data.targetKeyword.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` };
  }

  async updateOpportunityBriefById(id: number | string, data: Record<string, unknown>) {
    this.updates.push({ id, data });
  }
}
