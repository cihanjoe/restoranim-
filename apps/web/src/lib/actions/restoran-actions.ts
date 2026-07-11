"use server";

import { createClient } from "@/lib/supabase/server";

interface RestoranInput {
  name: string;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  franchise: boolean;
  opening_date?: string | null;
  manager_name?: string | null;
  manager_user_id?: string | null;
  status: string;
  google_score: number;
  yemeksepeti_score: number;
  getir_score: number;
  trendyol_yemek_score: number;
  franchise_owner?: string | null;
  franchise_owner_phone?: string | null;
  franchise_owner_email?: string | null;
  invoice_address?: string | null;
}

export async function createRestoran(
  restoranData: RestoranInput,
  selectedRegionalManagers: string[]
) {
  // 1. Oturumdan tenant_id al (server client ile)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  const tenantId = userData?.tenant_id;
  // UUID format kontrolü — string "undefined" varsa yakala
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!tenantId || !uuidRegex.test(String(tenantId))) {
    return { error: `Tenant bilgisi geçersiz (${JSON.stringify(tenantId)}). Lütfen tekrar giriş yapın.` };
  }

  // 2. Restoranı ekle (RLS kontrolü)
  // Sanitize: convert undefined/"undefined" to null for uuid/text fields
  const sanitized = Object.fromEntries(
    Object.entries(restoranData).map(([k, v]) => [
      k,
      v === undefined || v === "undefined" ? null : v,
    ])
  );
  // Debug: hangi alanlarda sorun var görelim
  const debugInfo = Object.entries(restoranData)
    .filter(([k, v]) => v === undefined || v === "undefined" || (typeof v === "string" && v.length > 0 && k !== "name" && k !== "status"))
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(", ");
  const { data: newRest, error: insertError } = await supabase
    .from("restaurants")
    .insert([{ ...sanitized, tenant_id: tenantId }])
    .select("id")
    .single();

  if (insertError) {
    return { error: `Restoran eklenemedi: ${insertError.message} | debug: ${debugInfo} | tenantId=${JSON.stringify(tenantId)}` };
  }

  // 3. Bölge müdürü atamalarını ekle
  const cleanManagers = selectedRegionalManagers.filter(
    (id) => id && id !== "undefined"
  );
  if (cleanManagers.length > 0) {
    const { error: rrmError } = await supabase
      .from("restaurant_regional_managers")
      .insert(
        cleanManagers.map((userId) => ({
          restaurant_id: newRest.id,
          regional_manager_user_id: userId,
        }))
      );

    if (rrmError) {
      return { error: `Bölge müdürü atanamadı: ${rrmError.message}` };
    }
  }

  return { success: true, id: newRest.id };
}

export async function updateRestoran(
  id: string,
  restoranData: RestoranInput,
  selectedRegionalManagers: string[]
) {
  const supabase = await createClient();

  // 1. Restoranı güncelle (RLS kontrolü)
  // Sanitize: convert undefined/"undefined" to null
  const sanitized = Object.fromEntries(
    Object.entries(restoranData).map(([k, v]) => [
      k,
      v === undefined || v === "undefined" ? null : v,
    ])
  );
  // Debug: hangi alanlarda sorun var görelim
  const debugInfo = Object.entries(restoranData)
    .filter(([k, v]) => v === undefined || v === "undefined" || (typeof v === "string" && v.length > 0 && k !== "name" && k !== "status"))
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(", ");
  const { error: updateError } = await supabase
    .from("restaurants")
    .update(sanitized)
    .eq("id", id);

  if (updateError) {
    return { error: `Restoran güncellenemedi: ${updateError.message} | debug: ${debugInfo}` };
  }

  // 2. Bölge müdürü atamalarını yenile
  await supabase
    .from("restaurant_regional_managers")
    .delete()
    .eq("restaurant_id", id);

  const cleanManagers = selectedRegionalManagers.filter(
    (id) => id && id !== "undefined"
  );
  if (cleanManagers.length > 0) {
    const { error: rrmError } = await supabase
      .from("restaurant_regional_managers")
      .insert(
        cleanManagers.map((userId) => ({
          restaurant_id: id,
          regional_manager_user_id: userId,
        }))
      );

    if (rrmError) {
      return { error: `Bölge müdürü atanamadı: ${rrmError.message}` };
    }
  }

  return { success: true };
}