import { defineCodeSource } from "@your-os/content-source";
/**
 * The seam between tenant content modules and @your-os/content-source.
 * The tenant declares ContentSource instances per content type once; pages
 * import these (never the raw content modules).
 */
import type { Article } from "@your-os/content-types";
import { articles } from "./content/articles/index.js";

export const articlesSource = defineCodeSource<Article>({ entries: articles });
