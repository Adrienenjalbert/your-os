# @your-os/eslint-config

Despite the name, this exports a canonical Biome config (the OS uses Biome, not ESLint, matching Career Hub). The package is named for discoverability.

Tenants extend it via:

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "extends": ["@your-os/eslint-config/biome.json"]
}
```
