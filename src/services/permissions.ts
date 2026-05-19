// src/services/permissions.ts
//
// Role-Based Access Control — mirrors Table 4.4.8 of the AIRES thesis.
// Keep this file in sync with the matrix; backend must enforce the same.

export type Role = "clerk" | "analyst" | "judge" | "admin"

export type Permission =
  | 'upload_evidence'
  | 'view_results'
  | 'run_analysis'
  | 'generate_reports'
  | 'download_reports'
  | 'manage_users'
  | 'view_audit_logs'
  | 'create_case'   // derived: you need a case to upload evidence into

const MATRIX: Record<Role, Permission[]> = {
  clerk: [
    'upload_evidence',
    'view_results',
    'download_reports',
    'generate_reports',
    'create_case',
  ],
  analyst: [
    'upload_evidence',
    'view_results',
    'run_analysis',
    'generate_reports',
    'download_reports',
    'view_audit_logs',
    'create_case',
  ],
  judge: [
    'view_results',
    'download_reports',
    'generate_reports',
    'view_audit_logs',
  ],
  admin: [
    'upload_evidence',
    'view_results',
    'run_analysis',
    'generate_reports',
    'download_reports',
    'manage_users',
    'view_audit_logs',
    'create_case',
  ],
}

export function roleHasPermission(
  role: Role | null | undefined,
  perm: Permission,
): boolean {
  if (!role) return false
  return MATRIX[role]?.includes(perm) ?? false
}

export const ROLE_LABELS: Record<Role, string> = {
  clerk:   'Clerk',
  analyst: 'Forensic Analyst',
  judge:   'Judge',
  admin:   'Administrator',
}