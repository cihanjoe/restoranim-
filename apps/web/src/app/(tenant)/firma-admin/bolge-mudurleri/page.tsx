"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";
import { usePathname } from "next/navigation";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPhone,
  FiMail,
  FiSearch,
  FiUploadCloud,
  FiUser,
} from "react-icons/fi";
import {
  createBolgeMudur,
  deleteBolgeMudurleri,
  updateBolgeMudur,
} from "@/lib/actions/bolge-mudurleri-actions";
import { showDeleteConfirm } from "@/lib/actions/swal";

interface RegionalManager {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  status: string;
  created_at: string;
}

interface ManagerForm {
  full_name: string;
  email: string;
  phone: string;
  password?: string;
  photo_url?: string;
}

const defaultForm: ManagerForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  photo_url: "",
};

export default function BolgeMudurleriPage() {
  const [managers, setManagers] = useState<RegionalManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editManager, setEditManager] = useState<RegionalManager | null>(null);
  const [form, setForm] = useState<ManagerForm>({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { user, loading: userLoading } = useUser();
  const pathname = usePathname();
  const supabase = createClient();

  const fetchManagers = useCallback(async () => {
    if (!user?.tenant_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, phone, photo_url, status, created_at")
      .eq("role", "bolge_muduru")
      .eq("tenant_id", user.tenant_id) // Eksik olan firma filtresi eklendi
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setManagers(data ?? []);
    setLoading(false);
  }, [supabase, user?.tenant_id]);

  useEffect(() => {
  if (!userLoading) {
    if (user?.tenant_id) {
      fetchManagers();
    } else setLoading(false);
  }
  }, [user, userLoading, fetchManagers, pathname]);

  const openAdd = () => {
    setEditManager(null);
    setForm({ ...defaultForm });
    setMessage("");
    setShowModal(true);
  };

  const openEdit = (m: RegionalManager) => {
    setEditManager(m);
    setForm({
      full_name: m.full_name,
      email: m.email,
      phone: m.phone ?? "",
      photo_url: m.photo_url ?? "",
      password: "",
    });
    setMessage("");
    setShowModal(true);
  };

  const handleFormChange = (field: keyof ManagerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      setMessage("Ad soyad ve e-posta zorunludur");
      return;
    }
    if (!editManager && !form.password) {
      if (!confirm("Şifre alanı boş. Varsayılan şifre '123456' olarak ayarlanacak. Onaylıyor musunuz?")) {
        return;
      }
    }

    setSaving(true);
    setMessage("");

    let photoUrl = editManager?.photo_url ?? "";

    // Fotoğraf yükleme (Ekleme ve Güncelleme için ortak)
    if (photoFile) {
      setUploading(true);
      const filePath = `${user?.id}/${Date.now()}_${photoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, photoFile, { upsert: true }); // upsert: true, güncellemede üzerine yazmayı sağlar

      if (uploadError) {
        setMessage(`Fotoğraf yüklenemedi: ${uploadError.message}`);
        setSaving(false);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      photoUrl = urlData.publicUrl;
      setUploading(false);
    }

    const payload = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      photo_url: photoUrl || null,
    };

    const result = editManager
      ? await updateBolgeMudur(
          editManager.id,
          payload,
          form.password,
        )
      : await createBolgeMudur(
          payload,
          form.password,
        );

    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage(editManager ? "Bölge müdürü güncellendi ✅" : "Bölge müdürü eklendi ✅");
      setShowModal(false);
      fetchManagers();
    }

    setSaving(false);
    setPhotoFile(null);
  };

  const handleDelete = async () => {
    if (selectedManagers.length === 0) return;

    const resultConfirm = await showDeleteConfirm(selectedManagers.length, "bölge müdürünü");
    if (!resultConfirm.isConfirmed) return;
    
    const result = await deleteBolgeMudurleri(selectedManagers);

    setMessage(result.error ?? `${selectedManagers.length} bölge müdürü silindi ✅`);
    setSelectedManagers([]);
    fetchManagers();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedManagers(managers.map((m) => m.id));
    } else {
      setSelectedManagers([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedManagers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredManagers = useMemo(() => {
    if (!searchTerm) {
      return managers;
    }
    return managers.filter(
      (m) =>
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [managers, searchTerm]);

  if (loading || userLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-1 flex-shrink-0">Bölge Müdürleri ({filteredManagers.length})</h4>
        <div className="input-group w-100 mx-4" style={{ maxWidth: "400px" }}>
          <span className="input-group-text bg-white border-end-0"><FiSearch /></span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="İsim veya e-postada ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2 flex-shrink-0">
          {selectedManagers.length > 0 && (
            <button className="btn btn-danger d-flex align-items-center gap-2" onClick={handleDelete}>
              <FiTrash2 size={16} /> Sil ({selectedManagers.length})
            </button>
          )}
          <button className="btn btn-primary d-flex align-items-center gap-2 flex-shrink-0" onClick={openAdd}>
            <FiPlus size={16} /> Ekle
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes("✅") ? "alert-success" : "alert-danger"} py-2 small`}>
          {message}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted">
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={managers.length > 0 && selectedManagers.length === managers.length}
                  />
                </th>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Durum</th>
                <th>Kayıt Tarihi</th>
                <th style={{ width: 120 }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    {searchTerm ? "Arama sonucu bulunamadı." : "Henüz bölge müdürü eklenmemiş."}
                  </td>
                </tr>
              ) : (
                filteredManagers.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedManagers.includes(m.id)}
                        onChange={() => handleSelectOne(m.id)}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.full_name} className="rounded-circle" style={{ width: 36, height: 36, objectFit: 'cover' }} />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary fw-bold"
                            style={{ width: 36, height: 36, fontSize: 14 }}
                          >
                            {m.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="fw-semibold">{m.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="small d-flex align-items-center gap-1">
                        <FiMail size={12} className="text-muted" />
                        {m.email}
                      </div>
                    </td>
                    <td>
                      <div className="small d-flex align-items-center gap-1">
                        <FiPhone size={12} className="text-muted" />
                        {m.phone || "—"}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${m.status === "active" ? "bg-success" : "bg-secondary"}`}>
                        {m.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {new Date(m.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => openEdit(m)}
                        >
                          <FiEdit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">
                  {editManager ? "Bölge Müdürü Düzenle" : "Yeni Bölge Müdürü Ekle"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  {photoFile ? (
                    <img src={URL.createObjectURL(photoFile)} alt="Önizleme" className="rounded-circle" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                  ) : form.photo_url ? (
                    <img src={form.photo_url} alt={form.full_name} className="rounded-circle" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-secondary bg-opacity-10" style={{ width: 64, height: 64 }}>
                      <FiUser size={32} className="text-muted" />
                    </div>
                  )}
                  <div>
                    <label htmlFor="photo-upload" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2">
                      <FiUploadCloud size={16} /> Fotoğraf Yükle
                    </label>
                    <input id="photo-upload" type="file" accept="image/*" className="d-none" onChange={handlePhotoSelect} />
                    <div className="small text-muted mt-1">PNG veya JPG, maks 2MB.</div>
                  </div>
                </div>

                {message && !message.includes("✅") && (
                  <div className="alert alert-danger py-2 small">
                    {message}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small text-muted">Ad Soyad *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.full_name}
                      onChange={(e) => handleFormChange("full_name", e.target.value)}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted">E-posta *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      placeholder="ornek@email.com"
                      disabled={!!editManager}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted">Telefon</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                      placeholder="5XX XXX XX XX"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted">
                      {editManager ? "Yeni Şifre (boş bırakılırsa değişmez)" : "Şifre *"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.password}
                      onChange={(e) => handleFormChange("password", e.target.value)}
                      placeholder="En az 6 karakter"
                    />
                    {!editManager && (
                      <div className="small text-muted mt-1">
                        Boş bırakılırsa varsayılan şifre atanır.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  İptal
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>
                  {saving ? (uploading ? "Fotoğraf Yükleniyor..." : "Kaydediliyor...") : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}