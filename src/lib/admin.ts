import { supabase } from "@/integrations/supabase/client";

export async function checkAdminAccess() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return false;
  const result = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (result.error) throw result.error;
  return result.data === true;
}