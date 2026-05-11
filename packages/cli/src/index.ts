/**
 * @your-os/cli — programmatic API.
 *
 * The bin (`your-os`) wraps these. Tests + the configurator app call them
 * directly to scaffold/maintain tenants.
 */
export { initTenant, type InitTenantOptions, type InitTenantResult } from "./commands/init.js";
export { syncTenant, type SyncTenantOptions, type SyncTenantResult } from "./commands/sync.js";
export { lintTenant, type LintTenantOptions } from "./commands/lint.js";
export { addPage, type AddPageOptions } from "./commands/add.js";
export {
  doctor,
  formatReport,
  type DoctorOptions,
  type DoctorReport,
  type DoctorCheck,
} from "./commands/doctor.js";
