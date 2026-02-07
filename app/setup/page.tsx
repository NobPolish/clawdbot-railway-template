import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SetupDashboard } from "@/components/setup-dashboard"

export default async function SetupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: config } = await supabase
    .from("openclaw_configs")
    .select("*")
    .eq("user_id", user.id)
    .eq("config_name", "default")
    .single()

  return <SetupDashboard user={user} initialConfig={config} />
}
