"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiEdit2,
  FiFileText,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useUser } from "@/lib/hooks/useUser";
import {
  fetchSections as fetchSectionsAction,
  createSection,
  updateSection,
  deleteSection as deleteSectionAction,
  createQuestion,
  updateQuestion,
  deleteQuestion as deleteQuestionAction,
} from "@/lib/actions/form-builder-actions";

interface Question {
  id: string;
  section_id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  photo_required: boolean;
  sort_order: number;
  status: string;
}

interface Section {
  id: string;
  title: string;
  sort_order: number;
  status: string;
  created_at: string;
  odz_form_questions?: Question[];
}

interface SectionForm {
  title: string;
  sort_order: number;
  status: string;
}

interface QuestionForm {
  section_id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  photo_required: boolean;
  sort_order: number;
  status: string;
}

const defaultSectionForm: SectionForm = {
  title: "",
  sort_order: 0,
  status: "active",
};

const defaultQuestionForm: QuestionForm = {
  section_id: "",
  question_text: "",
  question_type: "choice_3",
  is_required: true,
  photo_required: false,
  sort_order: 0,
  status: "active",
};

const questionTypeLabels: Record<string, string> = {
  choice_3: "Uygun / Uygun Değil / Değ. Dışı",
  text: "Metin",
  number: "Sayı",
  photo_only: "Sadece Fotoğraf",
};

function isErrorMessage(message: string) {
  return (
    message.includes("bulunamadı") ||
    message.includes("zorunludur") ||
    message.includes("alınamadı") ||
    message.includes("eklenemedi") ||
    message.includes("güncellenemedi") ||
    message.includes("silinemedi")
  );
}

export default function FormBuilderPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionForm>({
    ...defaultSectionForm,
  });
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    ...defaultQuestionForm,
  });
  const [saving, setSaving] = useState(false);

  const { user, loading: userLoading } = useUser();

  const fetchSections = useCallback(async () => {
    setLoading(true);
    const result = await fetchSectionsAction();

    if (result.error) {
      setMessage(result.error);
      setLoading(false);
      return;
    }

    setSections(
      (result.data ?? []).map((section: Section) => ({
        ...section,
        odz_form_questions: [...(section.odz_form_questions ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userLoading) {
      fetchSections();
    }
  }, [fetchSections, userLoading]);

  const openAddSection = () => {
    setEditSection(null);
    setSectionForm({
      ...defaultSectionForm,
      sort_order: sections.length + 1,
    });
    setMessage("");
    setShowSectionModal(true);
  };

  const openEditSection = (section: Section) => {
    setEditSection(section);
    setSectionForm({
      title: section.title,
      sort_order: section.sort_order,
      status: section.status,
    });
    setMessage("");
    setShowSectionModal(true);
  };

  const openAddQuestion = (section: Section) => {
    setEditQuestion(null);
    setQuestionForm({
      ...defaultQuestionForm,
      section_id: section.id,
      sort_order: (section.odz_form_questions?.length ?? 0) + 1,
    });
    setMessage("");
    setShowQuestionModal(true);
  };

  const openEditQuestion = (question: Question) => {
    setEditQuestion(question);
    setQuestionForm({
      section_id: question.section_id,
      question_text: question.question_text,
      question_type: question.question_type,
      is_required: question.is_required,
      photo_required: question.photo_required,
      sort_order: question.sort_order,
      status: question.status,
    });
    setMessage("");
    setShowQuestionModal(true);
  };

  const saveSection = async () => {
    if (!sectionForm.title.trim()) {
      setMessage("Bölüm başlığı zorunludur.");
      return;
    }

    setSaving(true);
    setMessage("");

    const result = editSection
      ? await updateSection(editSection.id, {
          title: sectionForm.title.trim(),
          sort_order: sectionForm.sort_order,
          status: sectionForm.status,
        })
      : await createSection({
          title: sectionForm.title.trim(),
          sort_order: sectionForm.sort_order,
          status: sectionForm.status,
        });

    if (result.error) {
      setMessage(result.error);
      setSaving(false);
      return;
    }

    setMessage(editSection ? "Bölüm güncellendi." : "Bölüm eklendi.");
    setShowSectionModal(false);
    setSaving(false);
    fetchSections();
  };

  const saveQuestion = async () => {
    if (!questionForm.section_id || !questionForm.question_text.trim()) {
      setMessage("Bölüm ve soru metni zorunludur.");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      section_id: questionForm.section_id,
      question_text: questionForm.question_text.trim(),
      question_type: questionForm.question_type,
      is_required: questionForm.is_required,
      photo_required: questionForm.photo_required,
      sort_order: questionForm.sort_order,
      status: questionForm.status,
    };

    const result = editQuestion
      ? await updateQuestion(editQuestion.id, payload)
      : await createQuestion(payload);

    if (result.error) {
      setMessage(result.error);
      setSaving(false);
      return;
    }

    setMessage(editQuestion ? "Soru güncellendi." : "Soru eklendi.");
    setShowQuestionModal(false);
    setSaving(false);
    fetchSections();
  };

  const deleteSection = async (section: Section) => {
    if (
      !confirm(
        `${section.title} bölümünü ve içindeki soruları silmek istediğinize emin misiniz?`,
      )
    ) {
      return;
    }

    const result = await deleteSectionAction(section.id);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Bölüm silindi.");
    fetchSections();
  };

  const deleteQuestion = async (question: Question) => {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;

    const result = await deleteQuestionAction(question.id);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Soru silindi.");
    fetchSections();
  };

  const totalQuestions = sections.reduce(
    (total, section) => total + (section.odz_form_questions?.length ?? 0),
    0,
  );
  const activeSections = sections.filter(
    (section) => section.status === "active",
  ).length;

  if (loading || userLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <output className="spinner-border text-primary">
          <span className="visually-hidden">Yükleniyor...</span>
        </output>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h5 fw-bold text-dark mb-1">ODZ Form Builder</h2>
          <p className="text-muted small mb-0">
            Ziyaret formu bölümlerini ve dinamik soruları yönetin.
          </p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={openAddSection}
          type="button"
        >
          <FiPlus size={16} />
          Bölüm Ekle
        </button>
      </div>

      {message && (
        <div
          className={`alert ${isErrorMessage(message) ? "alert-danger" : "alert-success"} py-2 small`}
        >
          {message}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Toplam Bölüm</div>
                <div className="h4 fw-bold mb-0">{sections.length}</div>
              </div>
              <div className="bg-soft-primary text-primary rounded-3 p-3">
                <FiFileText size={22} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Aktif Bölüm</div>
                <div className="h4 fw-bold mb-0">{activeSections}</div>
              </div>
              <div className="bg-soft-success text-success rounded-3 p-3">
                <FiCheckCircle size={22} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Toplam Soru</div>
                <div className="h4 fw-bold mb-0">{totalQuestions}</div>
              </div>
              <div className="bg-soft-info text-info rounded-3 p-3">
                <FiFileText size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <div className="text-muted mb-3">
              Henüz ODZ form bölümü tanımlanmamış.
            </div>
            <button
              className="btn btn-primary"
              onClick={openAddSection}
              type="button"
            >
              İlk Bölümü Ekle
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {sections.map((section) => (
            <div className="card border-0 shadow-sm rounded-4" key={section.id}>
              <div className="card-header bg-transparent border-bottom-0 pt-4 px-4">
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-soft-primary text-primary">
                        #{section.sort_order}
                      </span>
                      <span
                        className={`badge ${section.status === "active" ? "bg-success" : "bg-secondary"}`}
                      >
                        {section.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                    <h5 className="fw-bold mb-0">{section.title}</h5>
                    <div className="small text-muted">
                      {section.odz_form_questions?.length ?? 0} soru
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      onClick={() => openAddQuestion(section)}
                      type="button"
                    >
                      <FiPlus size={14} />
                      Soru
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => openEditSection(section)}
                      type="button"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteSection(section)}
                      type="button"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body px-4 pt-0">
                {(section.odz_form_questions ?? []).length === 0 ? (
                  <div className="border rounded-3 text-center text-muted small py-4">
                    Bu bölümde henüz soru yok.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light small text-muted">
                        <tr>
                          <th style={{ width: 70 }}>Sıra</th>
                          <th>Soru</th>
                          <th>Tip</th>
                          <th>Zorunlu</th>
                          <th>Fotoğraf</th>
                          <th>Durum</th>
                          <th style={{ width: 110 }}>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(section.odz_form_questions ?? []).map((question) => (
                          <tr key={question.id}>
                            <td className="small text-muted">
                              {question.sort_order}
                            </td>
                            <td className="fw-semibold">
                              {question.question_text}
                            </td>
                            <td className="small">
                              {questionTypeLabels[question.question_type] ??
                                question.question_type}
                            </td>
                            <td>
                              <span
                                className={`badge ${question.is_required ? "bg-primary" : "bg-secondary"}`}
                              >
                                {question.is_required ? "Evet" : "Hayır"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${question.photo_required ? "bg-warning text-dark" : "bg-secondary"}`}
                              >
                                {question.photo_required
                                  ? "Zorunlu"
                                  : "Opsiyonel"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${question.status === "active" ? "bg-success" : "bg-secondary"}`}
                              >
                                {question.status === "active"
                                  ? "Aktif"
                                  : "Pasif"}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => openEditQuestion(question)}
                                  type="button"
                                >
                                  <FiEdit2 size={14} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteQuestion(question)}
                                  type="button"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSectionModal && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">
                  {editSection ? "Bölüm Düzenle" : "Yeni Bölüm"}
                </h5>
                <button
                  className="btn-close"
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label
                    className="form-label small text-muted"
                    htmlFor="section_title"
                  >
                    Bölüm Başlığı *
                  </label>
                  <input
                    className="form-control"
                    id="section_title"
                    value={sectionForm.title}
                    onChange={(event) =>
                      setSectionForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Örn: Şube Genel Kontrolü"
                  />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label
                      className="form-label small text-muted"
                      htmlFor="section_sort_order"
                    >
                      Sıra
                    </label>
                    <input
                      className="form-control"
                      id="section_sort_order"
                      min={0}
                      type="number"
                      value={sectionForm.sort_order}
                      onChange={(event) =>
                        setSectionForm((prev) => ({
                          ...prev,
                          sort_order: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label
                      className="form-label small text-muted"
                      htmlFor="section_status"
                    >
                      Durum
                    </label>
                    <select
                      className="form-select"
                      id="section_status"
                      value={sectionForm.status}
                      onChange={(event) =>
                        setSectionForm((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
                      }
                    >
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowSectionModal(false)}
                  type="button"
                >
                  İptal
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveSection}
                  disabled={saving}
                  type="button"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">
                  {editQuestion ? "Soru Düzenle" : "Yeni Soru"}
                </h5>
                <button
                  className="btn-close"
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label
                    className="form-label small text-muted"
                    htmlFor="question_section"
                  >
                    Bölüm *
                  </label>
                  <select
                    className="form-select"
                    id="question_section"
                    value={questionForm.section_id}
                    onChange={(event) =>
                      setQuestionForm((prev) => ({
                        ...prev,
                        section_id: event.target.value,
                      }))
                    }
                  >
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label
                    className="form-label small text-muted"
                    htmlFor="question_text"
                  >
                    Soru Metni *
                  </label>
                  <textarea
                    className="form-control"
                    id="question_text"
                    rows={3}
                    value={questionForm.question_text}
                    onChange={(event) =>
                      setQuestionForm((prev) => ({
                        ...prev,
                        question_text: event.target.value,
                      }))
                    }
                    placeholder="Örn: Mutfak genel temizlik durumu uygun mu?"
                  />
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label
                      className="form-label small text-muted"
                      htmlFor="question_type"
                    >
                      Soru Tipi
                    </label>
                    <select
                      className="form-select"
                      id="question_type"
                      value={questionForm.question_type}
                      onChange={(event) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          question_type: event.target.value,
                        }))
                      }
                    >
                      <option value="choice_3">
                        Uygun / Uygun Değil / Değ. Dışı
                      </option>
                      <option value="text">Metin</option>
                      <option value="number">Sayı</option>
                      <option value="photo_only">Sadece Fotoğraf</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label
                      className="form-label small text-muted"
                      htmlFor="question_sort_order"
                    >
                      Sıra
                    </label>
                    <input
                      className="form-control"
                      id="question_sort_order"
                      min={0}
                      type="number"
                      value={questionForm.sort_order}
                      onChange={(event) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          sort_order: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label
                      className="form-label small text-muted"
                      htmlFor="question_status"
                    >
                      Durum
                    </label>
                    <select
                      className="form-select"
                      id="question_status"
                      value={questionForm.status}
                      onChange={(event) =>
                        setQuestionForm((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
                      }
                    >
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        checked={questionForm.is_required}
                        className="form-check-input"
                        id="is_required"
                        onChange={(event) =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            is_required: event.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                      <label className="form-check-label" htmlFor="is_required">
                        Cevap zorunlu
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        checked={questionForm.photo_required}
                        className="form-check-input"
                        id="photo_required"
                        onChange={(event) =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            photo_required: event.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="photo_required"
                      >
                        Fotoğraf zorunlu
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowQuestionModal(false)}
                  type="button"
                >
                  İptal
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveQuestion}
                  disabled={saving}
                  type="button"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
