"use server";

import { Readable } from "stream";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ManagerPayload {
  full_name: string;
  email: string;
  phone: string | null;
  photo_url?: string | null;
}

async function uploadPhotoAsAdmin(
  photoUrl: string,
  photoData: ArrayBuffer,
): Promise<{ error?: string }> {
  const supabaseAdmin = await createAdminClient();
  const buffer = Buffer.from(photoData);

  const { error: uploadError } = await supabaseAdmin.storage
    .from("avatars")
    .upload(photoUrl, buffer, {
      // `path` is the full path, including the bucket. We only need the path inside the bucket.
      // Extract path after bucket name 'avatars/'
      upsert: true, // Allow overwriting for updates
    });

  if (uploadError) {
    return { error: `Admin fotoğraf yükleme hatası: ${uploadError.message}` };
  }
  return {};
}

export async function createBolgeMudur(
  payload: ManagerPayload,
  password?: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Yetkilendirme hatası." };

  const { data: tenantData, error: tenantError } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  if (tenantError || !tenantData?.tenant_id) {
    return { error: "Firma bilgisi alınamadı." };
  }

  // 1. Auth kullanıcısını oluştur
  const supabaseAdmin = await createAdminClient();
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: password || "123456",
      email_confirm: true, // Otomatik onayla
      user_metadata: {
        full_name: payload.full_name,
        avatar_url: payload.photo_url,
      },
    });

  if (authError || !authData.user) {
    return { error: `Kullanıcı oluşturulamadı: ${authError?.message}` };
  }

  // 2. users tablosuna ekle
  const { error: insertError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    tenant_id: tenantData.tenant_id,
    role: "bolge_muduru",
    status: "active",
    ...payload,
  });

  if (insertError) {
    // Rollback: Auth kullanıcısını sil
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { error: `Veritabanına kaydedilemedi: ${insertError.message}` };
  }

  revalidatePath("/firma-admin/bolge-mudurleri");
  return { success: true };
}

export async function updateBolgeMudur(
  id: string,
  payload: ManagerPayload,
  newPassword?: string,
) {
  const supabase = await createClient();

  // 1. users tablosunu güncelle
  const { error: updateError } = await supabase
    .from("users")
    .update({ full_name: payload.full_name, email: payload.email, phone: payload.phone, photo_url: payload.photo_url })
    .eq("id", id);

  if (updateError) {
    return { error: `Kullanıcı bilgileri güncellenemedi: ${updateError.message}` };
  }

  // 2. Auth kullanıcısını güncelle (şifre ve metadata)
  const supabaseAdmin = await createAdminClient();
  if (newPassword) {
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      id,
      { password: newPassword },
    );
    if (passwordError) {
      return { error: `Şifre güncellenemedi: ${passwordError.message}` };
    }
  }

  // Fotoğrafı da auth metadata'da güncelle
  if (payload.photo_url) {
    await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: { avatar_url: payload.photo_url },
    });
  }

  revalidatePath("/firma-admin/bolge-mudurleri");
  return { success: true };
}

export async function deleteBolgeMudurleri(ids: string[]) {
  const supabaseAdmin = await createAdminClient();

  // Auth kullanıcılarını sil
  for (const id of ids) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) {
      // Not: users tablosundaki silme işlemi (cascade) bunu otomatik halledebilir.
      // Eğer cascade yoksa, buradaki hataya rağmen devam edip db'den silmeyi deneyebiliriz.
      console.warn(`Auth kullanıcısı silinemedi (ID: ${id}): ${error.message}`);
    }
  }

  revalidatePath("/firma-admin/bolge-mudurleri");
  return { success: true };
}