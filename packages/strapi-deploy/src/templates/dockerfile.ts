/**
 * Pinned Strapi 5 Docker image with our migration runner baked in.
 * Multi-stage so the final image is slim. Tenant-agnostic.
 */
export const DEFAULT_DOCKERFILE = `# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20

FROM node:\${NODE_VERSION}-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f pnpm-lock.yaml ]; then npm install -g pnpm@10 && pnpm install --frozen-lockfile; \\
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \\
    else npm ci; fi

FROM node:\${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build || pnpm run build || yarn build

FROM node:\${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=1337
RUN apk add --no-cache tini
COPY --from=build /app /app
USER node
EXPOSE 1337
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
`;
