"use server";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------
// Veri Okuma (Server Action — tenant_id güvenilir alınır)
// ---------------------------------------------------------------

export async function fetchSections() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Oturum bulunamadı.", data: null };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!userData?.tenant_id) {
    return { error: "Tenant bilgisi bulunamadı.", data: null };
  }

  const { data, error } = await supabase
    .from("odz_form_sections")
    .select(
      "id, title, sort_order, status, created_at, odz_form_questions(id, section_id, question_text, question_type, is_required, photo_required, sort_order, status)",
    )
    .eq("tenant_id", userData.tenant_id)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: `Form bölümleri alınamadı: ${error.message}`, data: null };
  }

  return { data, error: null };
}

// ---------------------------------------------------------------
// Bölüm (Section) CRUD
// ---------------------------------------------------------------

export async function createSection(formData: {
  title: string;
  sort_order: number;
  status: string;
}) {
  const supabase = await createClient();

  // Session'dan tenant_id al
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!userData?.tenant_id) {
    return { error: "Tenant bilgisi bulunamadı." };
  }

  const { error } = await supabase
    .from("odz_form_sections")
    .insert({
      tenant_id: userData.tenant_id,
      title: formData.title.trim(),
      sort_order: formData.sort_order,
      status: formData.status,
      created_by_user_id: user.id,
    });

  if (error) {
    return { error: `Bölüm eklenemedi: ${error.message}` };
  }

  return { success: true };
}

export async function updateSection(
  id: string,
  formData: {
    title: string;
    sort_order: number;
    status: string;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("odz_form_sections")
    .update({
      title: formData.title.trim(),
      sort_order: formData.sort_order,
      status: formData.status,
    })
    .eq("id", id);

  if (error) {
    return { error: `Bölüm güncellenemedi: ${error.message}` };
  }

  return { success: true };
}

export async function deleteSection(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("odz_form_sections")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: `Bölüm silinemedi: ${error.message}` };
  }

  return { success: true };
}

// ---------------------------------------------------------------
// Soru (Question) CRUD
// ---------------------------------------------------------------

export async function createQuestion(formData: {
  section_id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  photo_required: boolean;
  sort_order: number;
  status: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("odz_form_questions")
    .insert({
      section_id: formData.section_id,
      question_text: formData.question_text.trim(),
      question_type: formData.question_type,
      is_required: formData.is_required,
      photo_required: formData.photo_required,
      sort_order: formData.sort_order,
      status: formData.status,
    });

  if (error) {
    return { error: `Soru eklenemedi: ${error.message}` };
  }

  return { success: true };
}

export async function updateQuestion(
  id: string,
  formData: {
    section_id: string;
    question_text: string;
    question_type: string;
    is_required: boolean;
    photo_required: boolean;
    sort_order: number;
    status: string;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("odz_form_questions")
    .update({
      section_id: formData.section_id,
      question_text: formData.question_text.trim(),
      question_type: formData.question_type,
      is_required: formData.is_required,
      photo_required: formData.photo_required,
      sort_order: formData.sort_order,
      status: formData.status,
    })
    .eq("id", id);

  if (error) {
    return { error: `Soru güncellenemedi: ${error.message}` };
  }

  return { success: true };
}

export async function deleteQuestion(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("odz_form_questions")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: `Soru silinemedi: ${error.message}` };
  }

  return { success: true };
}