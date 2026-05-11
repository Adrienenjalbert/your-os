/**
 * Reading-time + keyword helpers extracted byte-equivalent from
 * Career Hub's `nextjs-app/src/lib/seo/helpers/base.ts`.
 */
export const calculateReadingTime = (text: string, wordsPerMinute = 200): number => {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const generateKeywords = (
  primary: string[],
  location?: string,
  role?: string,
  industry?: string,
): string[] => {
  const keywords = [...primary];

  if (location) {
    keywords.push(
      `jobs in ${location}`,
      `${location} jobs`,
      `work in ${location}`,
      `flexible work ${location}`,
    );
  }

  if (role) {
    keywords.push(`${role} jobs`, `${role} salary`, `become a ${role}`, `${role} career`);
  }

  if (industry) {
    keywords.push(`${industry} jobs`, `${industry} careers`, `work in ${industry}`);
  }

  return Array.from(new Set(keywords));
};
