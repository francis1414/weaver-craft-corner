import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Bootstrap grant: the first account to sign in becomes the store administrator.
 * Once an administrator exists, later accounts get nothing.
 */
export const claimAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (error) throw error;

    const admins = data ?? [];
    if (admins.length > 0) {
      const mine = admins.some((row) => row.user_id === context.userId);
      return { granted: mine, reason: mine ? ("already" as const) : ("taken" as const) };
    }

    const { error: insertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (insertError) throw insertError;

    return { granted: true, reason: "bootstrapped" as const };
  });
