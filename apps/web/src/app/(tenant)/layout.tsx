import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/giris");
  }

  return <>{children}</>;
}