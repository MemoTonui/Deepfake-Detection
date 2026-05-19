// src/composables/usePermissions.ts
import { computed } from 'vue'
import { useAuth } from '@/services/auth'
import {
  roleHasPermission,
  type Permission,
  type Role,
} from '@/services/permissions'

export function usePermissions() {
  const { user } = useAuth()

  const role = computed<Role | null>(
    () => (user.value?.role as Role) ?? null,
  )

  function can(perm: Permission): boolean {
    return roleHasPermission(role.value, perm)
  }

  return {
    role,
    can,
    canUploadEvidence:  computed(() => can('upload_evidence')),
    canViewResults:     computed(() => can('view_results')),
    canRunAnalysis:     computed(() => can('run_analysis')),
    canGenerateReports: computed(() => can('generate_reports')),
    canDownloadReports: computed(() => can('download_reports')),
    canManageUsers:     computed(() => can('manage_users')),
    canViewAuditLogs:   computed(() => can('view_audit_logs')),
    canCreateCase:      computed(() => can('create_case')),
  }
}