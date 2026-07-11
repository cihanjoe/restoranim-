"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createTenantWithAdmin(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  const name = formData.get("name") as string;
  const subdomain = formData.get("subdomain") as string;
  const status = formData.get("status") as string;
  const contactName = formData.get("contact_name") as string;
  const contactEmail = formData.get("contact_email") as string;
  const contactPhone = formData.get("contact_phone") as string;
  const adminEmail = formData.get("admin_email") as string;
  const adminPassword = formData.get("admin_password") as string;
  const adminName = formData.get("admin_name") as string;

  // Validasyon
  if (!name || !subdomain || !adminEmail || !adminPassword || !adminName) {
    return { error: "Zorunlu alanları doldurun: firma adı, subdomain, admin e-posta, şifre, ad soyad" };
  }

  if (adminPassword.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır." };
  }

  try {
    // 1. Tenant oluştur
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert([
        {
          name,
          subdomain,
          status,
          contact_name: contactName || null,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
        },
      ])
      .select("id")
      .single();

    if (tenantError) {
      return { error: `Firma oluşturulamadı: ${tenantError.message}` };
    }

    // 2. Supabase Auth'ta kullanıcı oluştur (admin API - service_role key ile)
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: adminName },
    });

    if (authError) {
      // Tenant'ı geri al
      await supabase.from("tenants").delete().eq("id", tenant.id);
      return { error: `Admin kullanıcı oluşturulamadı: ${authError.message}` };
    }

    // 3. users tablosuna kaydet (admin client ile — RLS baypas)
    const { error: userError } = await adminSupabase.from("users").insert([
      {
        id: authUser.user.id,
        tenant_id: tenant.id,
        role: "firma_admin",
        full_name: adminName,
        email: adminEmail,
        status: "active",
      },
    ]);

    if (userError) {
      // Auth kullanıcısını ve tenant'ı temizle (service_role key ile)
      await adminSupabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from("tenants").delete().eq("id", tenant.id);
      return { error: `Kullanıcı kaydı oluşturulamadı: ${userError.message}` };
    }

    return { success: true, tenantId: tenant.id };
  } catch (err: any) {
    return { error: `Beklenmeyen hata: ${err.message}` };
  }
}

export async function updateTenant(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const subdomain = formData.get("subdomain") as string;
  const status = formData.get("status") as string;
  const contactName = formData.get("contact_name") as string;
  const contactEmail = formData.get("contact_email") as string;
  const contactPhone = formData.get("contact_phone") as string;

  const { error } = await supabase
    .from("tenants")
    .update({
      name,
      subdomain,
      status,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteTenant(id: string) {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Önce bu tenant'a bağlı kullanıcıları bul
  const { data: users } = await supabase
    .from("users")
    .select("id")
    .eq("tenant_id", id);

  // Auth kullanıcılarını sil (service_role key ile)
  if (users) {
    for (const u of users) {
      await adminSupabase.auth.admin.deleteUser(u.id);
    }
  }

  // Tenant'ı sil (cascade ile users da silinir)
  const { error } = await supabase.from("tenants").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
