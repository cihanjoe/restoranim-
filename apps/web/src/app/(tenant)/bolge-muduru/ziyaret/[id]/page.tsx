"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createActionFromVisit } from "@/lib/actions/visit-actions";

interface Section {
  id: string;
  title: string;
  sort_order: number;
  questions: Question[];
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  photo_required: boolean;
  sort_order: number;
}

interface Visit {
  id: string;
  visit_date: string;
  status: string;
  restaurant_id: string;
  restaurant_name?: string;
  tenant_id?: string;
}

interface Answer {
  [questionId: string]: {
    answer_value: string;
    notes: string;
    add_to_action: boolean;
  };
}

interface PhotoFile {
  file: File;
  preview: string;
}

interface UploadedPhoto {
  url: string;
  photo_id: string;
}

const CHOICE_3_OPTIONS = [
  { value: "uygun", label: "Uygun", cls: "btn-outline-success", activeCls: "btn-success" },
  { value: "uygun_degil", label: "Uygun Değil", cls: "btn-outline-danger", activeCls: "btn-danger" },
  { value: "disi", label: "Değerlendirme Dışı", cls: "btn-outline-secondary", activeCls: "btn-secondary" },
];

export default function ZiyaretWizardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [answers, setAnswers] = useState<Answer>({});
  const [photos, setPhotos] = useState<Record<string, PhotoFile[]>>({});
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, UploadedPhoto[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [visitNotFound, setVisitNotFound] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const totalSteps = sections.length;

  const saveAnswer = (questionId: string, field: string, value: string | boolean) => {
    setAnswers((prev) => {
      const updated = { ...prev };
      if (!updated[questionId]) {
        updated[questionId] = { answer_value: "", notes: "", add_to_action: false };
      }
      (updated[questionId] as Record<string, string | boolean>)[field] = value;
      return updated;
    });
  };

  const handlePhotoSelect = (questionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newPhotos: PhotoFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newPhotos.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }
    setPhotos((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] ?? []), ...newPhotos],
    }));
  };

  const removePhoto = (questionId: string, index: number) => {
    setPhotos((prev) => {
      const current = [...(prev[questionId] ?? [])];
      if (current[index]) {
        URL.revokeObjectURL(current[index].preview);
        current.splice(index, 1);
      }
      return { ...prev, [questionId]: current };
    });
  };

  const removeUploadedPhoto = (questionId: string, index: number) => {
    setUploadedPhotos((prev) => {
      const current = [...(prev[questionId] ?? [])];
      current.splice(index, 1);
      return { ...prev, [questionId]: current };
    });
  };

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/giris");
        return;
      }

      const { data: visitData, error: visitError } = await supabase
        .from("odz_visits")
        .select("id, visit_date, status, restaurant_id, tenant_id, restaurants!inner(name)")
        .eq("id", params.id)
        .single();

      if (visitError || !visitData) {
        setVisitNotFound(true);
        setLoading(false);
        return;
      }

      const v = visitData as Record<string, unknown>;
      const restaurants = v.restaurants as Record<string, string> | null;
      setVisit({
        id: v.id as string,
        visit_date: v.visit_date as string,
        status: v.status as string,
        restaurant_id: v.restaurant_id as string,
        restaurant_name: restaurants?.name ?? "Bilinmeyen",
        tenant_id: v.tenant_id as string,
      });

      const { data: sectionsData } = await supabase
        .from("odz_form_sections")
        .select("id, title, sort_order")
        .eq("status", "active")
        .order("sort_order", { ascending: true });

      const sectionIds = (sectionsData ?? []).map((s: Record<string, unknown>) => s.id as string);
      const { data: questionsData } = await supabase
        .from("odz_form_questions")
        .select("id, section_id, question_text, question_type, is_required, photo_required, sort_order")
        .in("section_id", sectionIds)
        .eq("status", "active")
        .order("sort_order", { ascending: true });

      const qMap: Record<string, Question[]> = {};
      (questionsData ?? []).forEach((q: Record<string, unknown>) => {
        const sectionId = q.section_id as string;
        if (!qMap[sectionId]) qMap[sectionId] = [];
        qMap[sectionId].push({
          id: q.id as string,
          question_text: q.question_text as string,
          question_type: q.question_type as string,
          is_required: q.is_required as boolean,
          photo_required: q.photo_required as boolean,
          sort_order: q.sort_order as number,
        });
      });

      const fullSections: Section[] = (sectionsData ?? []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        title: s.title as string,
        sort_order: s.sort_order as number,
        questions: qMap[s.id as string] ?? [],
      }));

      setSections(fullSections);

      // Mevcut cevapları yükle
      if (v.status === "completed" || v.status === "draft") {
        const { data: existingAnswers } = await supabase
          .from("odz_visit_answers")
          .select("id, question_id, answer_value, notes, add_to_action")
          .eq("visit_id", params.id);

        if (existingAnswers && existingAnswers.length > 0) {
          const loaded: Answer = {};
          const answerIds: Record<string, string> = {};
          existingAnswers.forEach((a: Record<string, unknown>) => {
            const qId = a.question_id as string;
            loaded[qId] = {
              answer_value: (a.answer_value as string) ?? "",
              notes: (a.notes as string) ?? "",
              add_to_action: (a.add_to_action as boolean) ?? false,
            };
            answerIds[qId] = a.id as string;
          });
          setAnswers(loaded);

          // Mevcut fotoğrafları yükle
          const answerIdList = Object.values(answerIds);
          if (answerIdList.length > 0) {
            const { data: answerPhotos } = await supabase
              .from("odz_visit_answer_photos")
              .select("visit_answer_id, visit_photo_id, odz_visit_photos(id, photo_url)")
              .in("visit_answer_id", answerIdList);

            if (answerPhotos && answerPhotos.length > 0) {
              const photoMap: Record<string, UploadedPhoto[]> = {};
              const answerIdToQuestionId: Record<string, string> = {};
              Object.entries(answerIds).forEach(([qId, aId]) => {
                answerIdToQuestionId[aId] = qId;
              });

              answerPhotos.forEach((ap: Record<string, unknown>) => {
                const answerId = ap.visit_answer_id as string;
                const questionId = answerIdToQuestionId[answerId];
                if (!questionId) return;
                const photo = ap.odz_visit_photos as Record<string, string> | null;
                if (!photo) return;
                if (!photoMap[questionId]) photoMap[questionId] = [];
                photoMap[questionId].push({
                  url: photo.photo_url,
                  photo_id: photo.id,
                });
              });
              setUploadedPhotos(photoMap);
            }
          }
        }
      }

      setLoading(false);
    }

    load();
  }, [params.id, supabase, router]);

  const uploadPhotosForQuestion = async (
    questionId: string,
    visitId: string,
    answerId: string,
  ): Promise<boolean> => {
    const questionPhotos = photos[questionId];
    if (!questionPhotos || questionPhotos.length === 0) return true;

    for (let i = 0; i < questionPhotos.length; i++) {
      const photo = questionPhotos[i];
      const ext = photo.file.name.split(".").pop() ?? "jpg";
      const storagePath = `${visit?.tenant_id}/${visit?.restaurant_id}/${visitId}/${questionId}_${Date.now()}_${i}.${ext}`;

      setUploadProgress(`Fotoğraf yükleniyor (${i + 1}/${questionPhotos.length})...`);

      const { error: uploadError } = await supabase.storage
        .from("odz-photos")
        .upload(storagePath, photo.file, { upsert: false });

      if (uploadError) {
        alert(`Fotoğraf yüklenemedi: ${uploadError.message}`);
        return false;
      }

      // odz_visit_photos tablosuna kaydet
      const { data: photoRow, error: photoInsertError } = await supabase
        .from("odz_visit_photos")
        .insert({
          visit_id: visitId,
          photo_url: storagePath,
          taken_at: new Date().toISOString(),
          uploaded_from: "web",
        })
        .select("id")
        .single();

      if (photoInsertError || !photoRow) {
        alert(`Fotoğraf kaydedilemedi: ${photoInsertError?.message}`);
        return false;
      }

      // odz_visit_answer_photos ara tablosuna eşle
      const { error: linkError } = await supabase
        .from("odz_visit_answer_photos")
        .insert({
          visit_answer_id: answerId,
          visit_photo_id: (photoRow as Record<string, string>).id,
        });

      if (linkError) {
        console.error("Fotoğraf eşleme hatası:", linkError.message);
      }
    }

    return true;
  };

  const handleSaveDraft = async (): Promise<Record<string, string>> => {
    setSaving(true);
    const entries = Object.entries(answers);
    const answerIdMap: Record<string, string> = {};

    if (entries.length === 0) {
      setSaving(false);
      return answerIdMap;
    }

    // Mevcut cevapları sil
    await supabase.from("odz_visit_answers").delete().eq("visit_id", params.id);

    // Cevapları tek tek insert et (id'leri almak için)
    for (const [questionId, ans] of entries) {
      const { data: ansRow, error } = await supabase
        .from("odz_visit_answers")
        .insert({
          visit_id: params.id,
          question_id: questionId,
          answer_value: ans.answer_value ?? "",
          notes: ans.notes ?? "",
          add_to_action: ans.add_to_action ?? false,
        })
        .select("id")
        .single();

      if (error) {
        alert("Cevap kaydedilemedi: " + error.message);
        setSaving(false);
        return answerIdMap;
      }

      if (ansRow) {
        answerIdMap[questionId] = (ansRow as Record<string, string>).id;
      }
    }

    // Fotoğrafları yükle
    const questionIdsWithPhotos = Object.keys(photos).filter(
      (qId) => photos[qId] && photos[qId].length > 0,
    );

    for (const qId of questionIdsWithPhotos) {
      const answerId = answerIdMap[qId];
      if (!answerId) continue;
      const success = await uploadPhotosForQuestion(qId, params.id, answerId);
      if (!success) {
        setSaving(false);
        return answerIdMap;
      }
    }

    // Yüklenen fotoğrafları temizle (artık uploaded olarak gösterilecek)
    setPhotos({});
    setUploadProgress("");
    setSaving(false);
    return answerIdMap;
  };

  const createActionsFromAnswers = async (answerIdMap: Record<string, string>, visit: Visit) => {
    // Tüm soruları düz listeye çevir
    const allQuestions: Record<string, Question> = {};
    sections.forEach((s) => {
      s.questions.forEach((q) => {
        allQuestions[q.id] = q;
      });
    });

    // add_to_action = true olan cevapları bul
    const actionEntries = Object.entries(answers).filter(
      ([, ans]) => ans.add_to_action === true,
    );

    if (actionEntries.length === 0) return;

    // Her tikli cevap için aksiyon oluştur
    for (const [questionId, answerId] of Object.entries(answerIdMap)) {
      const ans = answers[questionId];
      if (!ans?.add_to_action) continue;

      const question = allQuestions[questionId];
      if (!question || !answerId) continue;

      const title = ans.notes
        ? `${question.question_text} — ${ans.notes}`
        : question.question_text;

      // Termin tarihi: ziyaret tarihinden 7 gün sonra (varsayılan)
      const dueDate = new Date(visit.visit_date);
      dueDate.setDate(dueDate.getDate() + 7);

      const { error } = await createActionFromVisit({
        restaurant_id: visit.restaurant_id,
        source_visit_answer_id: answerId,
        title,
        due_date: dueDate.toISOString().split("T")[0],
      });

      if (error) {
        console.error("Aksiyon oluşturulamadı:", error);
      }
    }
  };

  const handleComplete = async () => {
    // Zorunlu soruları kontrol et
    for (const section of sections) {
      for (const q of section.questions) {
        if (q.is_required && (!answers[q.id]?.answer_value || answers[q.id]?.answer_value === "")) {
          alert(`\"${q.question_text}\" sorusu zorunludur.`);
          const secIdx = sections.findIndex((s) => s.id === section.id);
          setCurrentStep(secIdx);
          return;
        }
        // Fotoğraf zorunlu kontrolü
        if (q.photo_required) {
          const hasNew = photos[q.id] && photos[q.id].length > 0;
          const hasUploaded = uploadedPhotos[q.id] && uploadedPhotos[q.id].length > 0;
          if (!hasNew && !hasUploaded) {
            alert(`\"${q.question_text}\" sorusu için fotoğraf zorunludur.`);
            const secIdx = sections.findIndex((s) => s.id === section.id);
            setCurrentStep(secIdx);
            return;
          }
        }
        // "Uygun Değil" seçildiğinde yorum zorunluluğu
        if (q.question_type === "choice_3" && answers[q.id]?.answer_value && answers[q.id].answer_value !== "uygun") {
          const note = answers[q.id].notes ?? "";
          if (note.trim() === "") {
            alert(`\"${q.question_text}\" sorusu 'Uygun Değil' seçildiğinde yorum (neden) zorunludur.`);
            const secIdx = sections.findIndex((s) => s.id === section.id);
            setCurrentStep(secIdx);
            return;
          }
        }
      }
    }

    setCompleting(true);
    setUploadProgress("Cevaplar kaydediliyor...");

    // 1. Cevapları ve fotoğrafları kaydet
    const answerIdMap = await handleSaveDraft();

    // 2. Aksiyonları oluştur
    setUploadProgress("Aksiyonlar oluşturuluyor...");
    if (visit) {
      await createActionsFromAnswers(answerIdMap, visit);
    } else {
      console.error("Ziyaret bilgisi eksik, aksiyonlar oluşturulamadı.");
    }

    // 3. Ziyaret durumunu güncelle
    setUploadProgress("Ziyaret tamamlanıyor...");
    const { error } = await supabase
      .from("odz_visits")
      .update({ status: "completed" })
      .eq("id", params.id);

    setCompleting(false);
    setUploadProgress("");

    if (error) {
      alert("Tamamlama hatası: " + error.message);
      return;
    }

    setCurrentStep(totalSteps);
  };

  const isReadOnly = visit?.status === "completed" || visit?.status === "notified";

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (visitNotFound) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-5 text-center">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 mx-auto mb-3"
            style={{ width: 72, height: 72 }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h4 className="fw-bold mb-2">Ziyaret Bulunamadı</h4>
          <p className="text-muted mb-4">
            Bu ID&apos;ye sahip bir ziyaret kaydı bulunamadı.
          </p>
          <Link href="/bolge-muduru/ziyaretlerim" className="btn btn-primary">
            Ziyaretlerime Dön
          </Link>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="h5 fw-bold text-dark mb-1">ODZ Ziyaret Formu</h2>
            <p className="text-muted small mb-0">
              {visit?.restaurant_name} - {visit?.visit_date ? new Date(visit.visit_date).toLocaleDateString("tr-TR") : ""}
            </p>
          </div>
          <Link href="/bolge-muduru/ziyaretlerim" className="btn btn-outline-primary">
            Geri Dön
          </Link>
        </div>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-5 text-center">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 mx-auto mb-3"
              style={{ width: 72, height: 72 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffc107" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h4 className="fw-bold mb-2">Form Bölümleri Henüz Oluşturulmadı</h4>
            <p className="text-muted mb-0">
              Firma Admin panelinden ODZ Form Builder ile bölüm ve soruları
              tanımladıktan sonra bu sayfa kullanılabilir olacak.
            </p>
          </div>
        </div>
      </>
    );
  }

  // Finish/başarı ekranı
  if (currentStep === totalSteps) {
    // Aksiyon sayısını hesapla
    const actionCount = Object.values(answers).filter((a) => a.add_to_action).length;

    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="h5 fw-bold text-dark mb-1">ODZ Ziyaret Formu</h2>
            <p className="text-muted small mb-0">
              {visit?.restaurant_name} - {visit?.visit_date ? new Date(visit.visit_date).toLocaleDateString("tr-TR") : ""}
            </p>
          </div>
        </div>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-5 text-center">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mx-auto mb-3"
              style={{ width: 72, height: 72 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#198754" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h4 className="fw-bold mb-2">Ziyaret Tamamlandı</h4>
            <p className="text-muted mb-4">
              <strong>{visit?.restaurant_name}</strong> için ODZ ziyareti başarıyla tamamlandı.
            </p>
            {actionCount > 0 && (
              <div className="alert alert-info d-inline-flex align-items-center gap-2 mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>{actionCount} adet aksiyon planı oluşturuldu ve ilgili restorana atandı.</span>
              </div>
            )}
            <div className="d-flex justify-content-center gap-2">
              <Link href="/bolge-muduru/ziyaretlerim" className="btn btn-primary">
                Ziyaretlerime Dön
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentSection = sections[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <>
      {/* Progress indicator */}
      {(saving || completing) && uploadProgress && (
        <div className="alert alert-info py-2 small d-flex align-items-center gap-2 mb-3">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Sayfa Başlığı */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h5 fw-bold text-dark mb-1">ODZ Ziyaret Formu</h2>
          <p className="text-muted small mb-0">
            {visit?.restaurant_name} — {visit?.visit_date ? new Date(visit.visit_date).toLocaleDateString("tr-TR") : ""}
            {!isReadOnly && (
              <span className="ms-2 badge bg-warning text-dark">Taslak</span>
            )}
            {isReadOnly && (
              <span className="ms-2 badge bg-success">Tamamlandı</span>
            )}
          </p>
        </div>
        <div className="d-flex gap-2">
          {!isReadOnly && (
            <button className="btn btn-outline-secondary" onClick={() => handleSaveDraft()} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Taslak Kaydet"}
            </button>
          )}
          <Link href="/bolge-muduru/ziyaretlerim" className="btn btn-outline-primary">
            Geri
          </Link>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          {/* Step Indicators */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {sections.map((section, idx) => {
              const isActive = idx === currentStep;
              const isDone = idx < currentStep;
              return (
                <button
                  key={section.id}
                  className={`btn btn-sm d-flex align-items-center gap-2 ${
                    isActive
                      ? "btn-primary"
                      : isDone
                      ? "btn-success"
                      : "btn-light text-muted"
                  }`}
                  onClick={() => {
                    if (isDone || isReadOnly || isActive) {
                      setCurrentStep(idx);
                    }
                  }}
                  disabled={idx > currentStep && !isReadOnly}
                >
                  <span className={`badge rounded-pill ${isActive ? "bg-white text-primary" : isDone ? "bg-white text-success" : "bg-secondary"}`}>
                    {isDone ? "✓" : idx + 1}
                  </span>
                  <span className="small fw-semibold">{section.title}</span>
                </button>
              );
            })}
          </div>

          <hr className="my-0" />

          {/* Active Section Questions */}
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                📋 {currentSection.title}
              </h5>
              <span className="small text-muted">
                Adım {currentStep + 1} / {totalSteps}
              </span>
            </div>

            {currentSection.questions.length === 0 && (
              <p className="text-muted fst-italic">
                Bu bölümde henüz soru bulunmuyor.
              </p>
            )}

            <div className="d-flex flex-column gap-4">
              {currentSection.questions.map((q) => {
                const answer = answers[q.id];
                const questionPhotos = photos[q.id] ?? [];
                const existingPhotos = uploadedPhotos[q.id] ?? [];
                const showPhotoUpload = q.photo_required || q.question_type === "photo_only";

                return (
                  <div key={q.id} className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <label className="fw-semibold mb-0">
                        {q.question_text}
                        {q.is_required && <span className="text-danger ms-1">*</span>}
                      </label>
                      {q.photo_required && (
                        <span className="badge bg-warning bg-opacity-25 text-dark small">
                          📷 Fotoğraf Zorunlu
                        </span>
                      )}
                    </div>

                    {/* choice_3 tipi */}
                    {q.question_type === "choice_3" && (
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {CHOICE_3_OPTIONS.map((opt) => {
                          const selected = answer?.answer_value === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              className={`btn btn-sm ${selected ? opt.activeCls : opt.cls}`}
                              onClick={() => {
                                if (isReadOnly) return;
                                saveAnswer(q.id, "answer_value", opt.value);
                              }}
                              disabled={isReadOnly}
                            >
                              {selected && "✓ "}{opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* text tipi */}
                    {q.question_type === "text" && (
                      <textarea
                        className="form-control mt-2"
                        rows={2}
                        placeholder="Açıklama girin..."
                        value={answer?.answer_value ?? ""}
                        onChange={(e) => saveAnswer(q.id, "answer_value", e.target.value)}
                        disabled={isReadOnly}
                      />
                    )}

                    {/* number tipi */}
                    {q.question_type === "number" && (
                      <input
                        type="number"
                        className="form-control mt-2"
                        placeholder="Sayısal değer girin..."
                        value={answer?.answer_value ?? ""}
                        onChange={(e) => saveAnswer(q.id, "answer_value", e.target.value)}
                        disabled={isReadOnly}
                      />
                    )}

                    {/* Fotoğraf Yükleme Alanı */}
                    {(showPhotoUpload || q.question_type !== "photo_only") && showPhotoUpload && (
                      <div className="mt-3">
                        <div className="border border-dashed rounded-3 p-3 bg-light">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="text-muted small">📷 Fotoğraf Ekle</span>
                            {!isReadOnly && (
                              <label className="btn btn-sm btn-outline-primary mb-0" style={{ cursor: "pointer" }}>
                                Dosya Seç
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="d-none"
                                  onChange={(e) => handlePhotoSelect(q.id, e.target.files)}
                                />
                              </label>
                            )}
                          </div>

                          {/* Mevcut yüklü fotoğraflar */}
                          {existingPhotos.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {existingPhotos.map((photo, idx) => (
                                <div key={photo.photo_id} className="position-relative" style={{ width: 80, height: 80 }}>
                                  <div className="bg-secondary bg-opacity-25 rounded d-flex align-items-center justify-content-center h-100">
                                    <span className="small text-muted">📷 {idx + 1}</span>
                                  </div>
                                  {!isReadOnly && (
                                    <button
                                      className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 rounded-circle"
                                      style={{ width: 20, height: 20, fontSize: 10, lineHeight: 1 }}
                                      onClick={() => removeUploadedPhoto(q.id, idx)}
                                      type="button"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Yeni seçilen fotoğraflar (henüz yüklenmemiş) */}
                          {questionPhotos.length > 0 && (
                            <div className="d-flex flex-wrap gap-2">
                              {questionPhotos.map((photo, idx) => (
                                <div key={idx} className="position-relative" style={{ width: 80, height: 80 }}>
                                  <img
                                    src={photo.preview}
                                    alt={`Fotoğraf ${idx + 1}`}
                                    className="rounded border"
                                    style={{ width: 80, height: 80, objectFit: "cover" }}
                                  />
                                  {!isReadOnly && (
                                    <button
                                      className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 rounded-circle"
                                      style={{ width: 20, height: 20, fontSize: 10, lineHeight: 1 }}
                                      onClick={() => removePhoto(q.id, idx)}
                                      type="button"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {existingPhotos.length === 0 && questionPhotos.length === 0 && (
                            <div className="text-muted small text-center py-2">
                              Henüz fotoğraf eklenmedi
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* photo_only tipi - sadece fotoğraf yükleme */}
                    {q.question_type === "photo_only" && !showPhotoUpload && (
                      <div className="mt-3">
                        <div className="border border-dashed rounded-3 p-3 bg-light">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="text-muted small">📷 Fotoğraf Ekle</span>
                            {!isReadOnly && (
                              <label className="btn btn-sm btn-outline-primary mb-0" style={{ cursor: "pointer" }}>
                                Dosya Seç
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="d-none"
                                  onChange={(e) => handlePhotoSelect(q.id, e.target.files)}
                                />
                              </label>
                            )}
                          </div>
                          {questionPhotos.length > 0 && (
                            <div className="d-flex flex-wrap gap-2">
                              {questionPhotos.map((photo, idx) => (
                                <div key={idx} className="position-relative" style={{ width: 80, height: 80 }}>
                                  <img
                                    src={photo.preview}
                                    alt={`Fotoğraf ${idx + 1}`}
                                    className="rounded border"
                                    style={{ width: 80, height: 80, objectFit: "cover" }}
                                  />
                                  {!isReadOnly && (
                                    <button
                                      className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 rounded-circle"
                                      style={{ width: 20, height: 20, fontSize: 10, lineHeight: 1 }}
                                      onClick={() => removePhoto(q.id, idx)}
                                      type="button"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {questionPhotos.length === 0 && (
                            <div className="text-muted small text-center py-2">
                              Henüz fotoğraf eklenmedi
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Açıklama notu (photo_only dışında) */}
                    {q.question_type !== "photo_only" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Açıklama / yorum (isteğe bağlı)"
                          value={answer?.notes ?? ""}
                          onChange={(e) => saveAnswer(q.id, "notes", e.target.value)}
                          disabled={isReadOnly}
                        />
                      </div>
                    )}

                    {/* Aksiyona Ekle tik'i */}
                    {q.question_type !== "photo_only" && (
                      <div className="form-check mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`action-${q.id}`}
                          checked={answer?.add_to_action ?? false}
                          onChange={(e) => saveAnswer(q.id, "add_to_action", e.target.checked)}
                          disabled={isReadOnly}
                        />
                        <label className="form-check-label small" htmlFor={`action-${q.id}`}>
                          🚨 Aksiyona Ekle
                          {answer?.add_to_action && (
                            <span className="text-danger ms-1 fw-semibold">
                              (Bu soru aksiyon planına eklenecek)
                            </span>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between mt-4 pt-3 border-top">
            <div>
              {currentStep > 0 && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  ← Önceki
                </button>
              )}
            </div>
            <div className="d-flex gap-2">
              {!isLastStep ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Sonraki →
                </button>
              ) : !isReadOnly ? (
                <button
                  className="btn btn-success"
                  onClick={handleComplete}
                  disabled={completing}
                >
                  {completing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Tamamlanıyor...
                    </>
                  ) : (
                    "✅ Ziyareti Tamamla"
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
