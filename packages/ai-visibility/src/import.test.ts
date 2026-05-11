import { describe, expect, it } from "vitest";
import { parsePeecExport, parseProfoundExport } from "./import.js";

const PROFOUND_CSV = `week,engine,prompt,citation_url,position,share_pct
2026-04-28,ChatGPT,how do flex shifts work,https://indeedflex.com/articles/flex-shifts,1,15
2026-04-28,Perplexity,best paying warehouse jobs,https://indeedflex.com/guides/warehouse,2,8
2026-04-28,Claude,what is W-2 employment,https://other.com/w2,1,12`;

const PEEC_CSV = `date,ai_engine,prompt_text,source_url,rank,voice_share
2026-04-28,ChatGPT,how do flex shifts work,https://indeedflex.com/articles/flex-shifts,1,0.15
2026-04-28,AI Overviews,best paying warehouse jobs,https://indeedflex.com/guides/warehouse,3,0.06`;

describe("parseProfoundExport", () => {
  it("parses 3 rows with normalized engines", () => {
    const cs = parseProfoundExport(PROFOUND_CSV);
    expect(cs).toHaveLength(3);
    expect(cs[0]?.engine).toBe("chatgpt");
    expect(cs[1]?.engine).toBe("perplexity");
    expect(cs[2]?.engine).toBe("claude");
  });

  it("converts share_pct to a 0..1 fraction", () => {
    const cs = parseProfoundExport(PROFOUND_CSV);
    expect(cs[0]?.share).toBeCloseTo(0.15, 3);
    expect(cs[1]?.share).toBeCloseTo(0.08, 3);
  });

  it("throws when required columns are missing", () => {
    expect(() => parseProfoundExport("week,engine\n2026-04-28,ChatGPT")).toThrow();
  });
});

describe("parsePeecExport", () => {
  it("parses Peec rows including AI Overviews", () => {
    const cs = parsePeecExport(PEEC_CSV);
    expect(cs).toHaveLength(2);
    expect(cs[1]?.engine).toBe("ai-overviews");
    expect(cs[0]?.share).toBeCloseTo(0.15, 3);
  });
});
