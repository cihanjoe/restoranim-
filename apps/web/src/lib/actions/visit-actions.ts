"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionPayload {
  restaurant_id: string;
  source_visit_answer_id: string;
  title: string;
  due_date: string;
}

export async function createActionFromVisit(payload: ActionPayload) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Oturum bulunamadı." };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (userError || !userData?.tenant_id) {
    return { error: "Kullanıcıya ait firma bilgisi alınamadı." };
  }

  const { error: insertError } = await supabase.from("actions").insert({
    ...payload,
    tenant_id: userData.tenant_id, // Güvenli tenant_id kullanımı
    status: "open",
    opened_at: new Date().toISOString(),
    repeat_count: 1,
  });

  if (insertError) {
    return { error: `Aksiyon oluşturulamadı: ${insertError.message}` };
  }

  return { success: true };
}