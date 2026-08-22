import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function useAdminSession() {
  return useQuery({
    queryKey: ["admin", "session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return { user: null, isAdmin: false };
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      return {
        user: { id: user.id, email: user.email ?? "" },
        isAdmin: (roles ?? []).some((r) => r.role === "admin"),
      };
    },
    staleTime: 30_000,
  });
}
