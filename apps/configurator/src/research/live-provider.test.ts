import { describe, expect, it, vi } from "vitest";
import minimalBrief from "../fixtures/minimal.brief.json" with { type: "json" };
import { parseBrief } from "../schema.js";
import { LiveResearchProvider } from "./live-provider.js";

describe("LiveResearchProvider — fallback behavior (no env vars)", () => {
  it("falls back to MockResearchProvider when no credentials are set", async () => {
    const p = new LiveResearchProvider({});
    const serp = await p.serp("hospitality jobs", { limit: 3 });
    expect(serp).toHaveLength(3);
    expect(serp[0]?.url).toMatch(/example\.com/);
    const cluster = await p.keywordCluster("flex shifts");
    expect(cluster.primary).toBe("flex shifts");
    expect(cluster.secondary.length).toBeGreaterThan(0);
  });

  it("uses LLM mock for proposeIcps/proposeDbas when ANTHROPIC_API_KEY is unset", async () => {
    const p = new LiveResearchProvider({});
    const brief = parseBrief(minimalBrief);
    const icps = await p.proposeIcps(brief);
    const dbas = await p.proposeDbas(brief);
    expect(icps.length).toBeGreaterThan(0);
    expect(dbas.length).toBeGreaterThan(0);
  });
});

describe("LiveResearchProvider — real-vendor request shaping", () => {
  it("sends a Basic-auth POST to DataForSEO SERP endpoint", async () => {
    const fakeFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          tasks: [
            {
              result: [
                {
                  items: [
                    {
                      url: "https://example.org/a",
                      title: "What is hospitality work? A guide",
                      description: "Snippet A",
                    },
                    {
                      url: "https://example.org/b",
                      title: "Best hospitality jobs 2026",
                      description: "Snippet B",
                    },
                  ],
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    ) as unknown as typeof fetch;

    const p = new LiveResearchProvider({
      dataForSeoAuth: "user@example.com:secret",
      fetchImpl: fakeFetch,
    });
    const serp = await p.serp("hospitality jobs", { limit: 5 });
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    const callArgs = (fakeFetch as unknown as { mock: { calls: unknown[][] } }).mock.calls[0] ?? [];
    expect(callArgs[0]).toBe("https://api.dataforseo.com/v3/serp/google/organic/live/regular");
    const init = callArgs[1] as RequestInit;
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect((headers.Authorization ?? "").startsWith("Basic ")).toBe(true);
    expect(serp).toHaveLength(2);
    expect(serp[0]?.intent).toBe("informational");
    expect(serp[1]?.intent).toBe("commercial");
  });

  it("calls Anthropic with system prompt and parses JSON response", async () => {
    const fakeFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [
            {
              type: "text",
              text: '[{"id":"hr-director","role":"HR Director","industry":"hospitality","pain":"peak staffing gaps","cep":"need flex labor"}]',
            },
          ],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch;

    const p = new LiveResearchProvider({
      anthropicApiKey: "sk-test",
      fetchImpl: fakeFetch,
    });
    const icps = await p.proposeIcps(parseBrief(minimalBrief));
    expect(icps).toHaveLength(1);
    expect(icps[0]?.role).toBe("HR Director");
  });

  it("falls back to mock if Anthropic returns non-JSON", async () => {
    const fakeFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [{ type: "text", text: "Sorry, I can't do that as JSON." }],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch;

    const p = new LiveResearchProvider({
      anthropicApiKey: "sk-test",
      fetchImpl: fakeFetch,
    });
    const icps = await p.proposeIcps(parseBrief(minimalBrief));
    // Mock returns at least 1 ICP
    expect(icps.length).toBeGreaterThan(0);
  });

  it("strips code-fence wrapping in Anthropic responses", async () => {
    const fakeFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [
            {
              type: "text",
              text: '```json\n[{"type":"phrase","value":"Same Day Pay","rationale":"existing","prevalenceTarget":0.8}]\n```',
            },
          ],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch;

    const p = new LiveResearchProvider({
      anthropicApiKey: "sk-test",
      fetchImpl: fakeFetch,
    });
    const dbas = await p.proposeDbas(parseBrief(minimalBrief));
    expect(dbas[0]?.value).toBe("Same Day Pay");
  });
});
