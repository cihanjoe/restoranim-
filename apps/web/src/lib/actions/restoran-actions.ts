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

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (userError || !userData?.tenant_id) {
    return { error: "Kullanıcıya ait firma bilgisi alınamadı." };
  }
  const sanitized = Object.fromEntries(
    Object.entries(restoranData).map(([k, v]) => [
      k,
      v === undefined || v === "undefined" ? null : v,
    ])
  );
  const { data: newRest, error: insertError } = await supabase
    .from("restaurants")
    .insert([{ ...sanitized, tenant_id: userData.tenant_id }])
    .select("id")
    .single();

  if (insertError) {
    return { error: `Restoran eklenemedi: ${insertError.message}` };
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
  const sanitized = Object.fromEntries(
    Object.entries(restoranData).map(([k, v]) => [
      k,
      v === undefined || v === "undefined" ? null : v,
    ])
  );
  const { error: updateError } = await supabase
    .from("restaurants")
    .update(sanitized)
    .eq("id", id);

  if (updateError) {
    return { error: `Restoran güncellenemedi: ${updateError.message}` };
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

export async function deleteRestaurants(ids: string[]) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("restaurants")
    .delete()
    .in("id", ids);

  if (error) {
    return { error: `Restoranlar silinemedi: ${error.message}` };
  }

  return { success: true };
}