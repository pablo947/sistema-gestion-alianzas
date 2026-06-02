import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type AuditAction =
  | 'role_changed'
  | 'permissions_updated'
  | 'user_created'
  | 'user_activated'
  | 'user_edited';

type TargetType = 'user' | 'permission' | 'role';

export function useAuditLog() {
  const { user, userProfile } = useAuth();

  const log = async (
    action: AuditAction,
    targetType: TargetType,
    targetId: string | null,
    targetLabel: string | null,
    details?: Record<string, unknown>
  ) => {
    if (!user) return;

    try {
      await supabase.from('audit_logs' as any).insert({
        user_id: user.id,
        user_email: userProfile?.email || user.email || 'unknown',
        action,
        target_type: targetType,
        target_id: targetId,
        target_label: targetLabel,
        details: details || {},
      } as any);
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  };

  return { log };
}
