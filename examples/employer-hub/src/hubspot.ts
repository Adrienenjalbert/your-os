import tenantConfig from "../tenant.config.js";

/**
 * Minimal HubSpot integration scaffold for the demo-booking conversion event.
 * Production wiring (server actions, retry/backoff, audit log) lands in
 * Phase 6 control-plane attribution write-back. This module is the seam.
 */
export interface DemoBookingPayload {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  /** UTM dict pulled from the page's attribution layer. */
  attribution?: Record<string, string>;
}

export interface HubspotConfig {
  portalId: string;
  formId: string;
  privateAppToken?: string;
}

export function getHubspotConfig(): HubspotConfig {
  const cfg = tenantConfig.integrations.crmConfig;
  return {
    portalId: process.env[cfg.portalIdEnv ?? "HUBSPOT_PORTAL_ID"] ?? "",
    formId: process.env[cfg.formIdEnv ?? "HUBSPOT_DEMO_FORM_ID"] ?? "",
    privateAppToken: process.env[cfg.privateAppTokenEnv ?? "HUBSPOT_PRIVATE_APP_TOKEN"],
  };
}

/**
 * Submit a demo booking to the HubSpot Forms API. Caller is responsible for
 * retrying on network errors; this scaffold returns the response shape so
 * the page can show "Thanks, you'll hear from us in 24 hours."
 */
export async function submitDemoBooking(
  payload: DemoBookingPayload,
  fetchImpl: typeof globalThis.fetch = globalThis.fetch.bind(globalThis),
): Promise<{ ok: true; submittedAt: string } | { ok: false; error: string }> {
  const cfg = getHubspotConfig();
  if (!cfg.portalId || !cfg.formId) {
    return { ok: false, error: "HubSpot portalId/formId not configured." };
  }
  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${cfg.portalId}/${cfg.formId}`;
  const fields = [
    { name: "email", value: payload.email },
    { name: "firstname", value: payload.firstName },
    { name: "lastname", value: payload.lastName },
    { name: "company", value: payload.company },
    { name: "jobtitle", value: payload.role },
  ];
  for (const [k, v] of Object.entries(payload.attribution ?? {})) {
    fields.push({ name: k, value: v });
  }
  const res = await fetchImpl(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cfg.privateAppToken ? { authorization: `Bearer ${cfg.privateAppToken}` } : {}),
    },
    body: JSON.stringify({
      fields,
      context: { pageUri: payload.attribution?.page_uri ?? "" },
    }),
  });
  if (!res.ok) {
    return { ok: false, error: `HubSpot ${res.status} ${res.statusText}` };
  }
  return { ok: true, submittedAt: new Date().toISOString() };
}
