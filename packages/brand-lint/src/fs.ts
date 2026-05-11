import { readdir } from "node:fs/promises";
import { join } from "node:path";

export interface FindContentFilesOptions {
  /** Path segment that identifies content data files. Default: "/data/". */
  dataPathSegment?: string;
  /** File-name suffixes to skip. */
  excludeSuffixes?: readonly string[];
  /** Exact file names to skip. */
  excludeNames?: readonly string[];
  /** Substrings to skip in the file name. */
  excludeNameSubstrings?: readonly string[];
}

const DEFAULT_OPTIONS: Required<FindContentFilesOptions> = {
  dataPathSegment: "/data/",
  excludeSuffixes: [".test.ts", ".d.ts"],
  excludeNames: ["helpers.ts", "types.ts"],
  excludeNameSubstrings: [".helpers.", ".types."],
};

/**
 * Recursively walks a tenant's source tree and returns all content data files.
 * Mirrors the file-discovery logic from Career Hub's brand-lint script.
 */
export async function findContentFiles(
  rootDir: string,
  options: FindContentFilesOptions = {},
): Promise<string[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const files: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        await walk(path);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;
      if (opts.excludeSuffixes.some((s) => entry.name.endsWith(s))) continue;
      if (opts.excludeNames.includes(entry.name)) continue;
      if (opts.excludeNameSubstrings.some((s) => entry.name.includes(s))) continue;
      if (!path.includes(opts.dataPathSegment)) continue;
      files.push(path);
    }
  }

  await walk(rootDir);
  return files;
}
