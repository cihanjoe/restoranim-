"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { ILER } from "@/lib/sabitler";

interface BolgeMudur {
  id: string;
  full_name: string;
}

interface Restaurant {
  id: string;
  name: string;
  city: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  franchise: boolean;
  opening_date: string | null;
  manager_name: string | null;
  manager_user_id: string | null;
  status: string;
  google_score: number | null;
  yemeksepeti_score: number | null;
  getir_score: number | null;
  trendyol_yemek_score: number | null;
  franchise_owner: string | null;
  franchise_owner_phone: string | null;
  franchise_owner_email: string | null;
  invoice_address: string | null;
  created_at: string;
}

interface RestaurantForm {
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  franchise: boolean;
  opening_date: string;
  manager_name: string;
  manager_user_id: string;
  status: string;
  google_score: string;
  yemeksepeti_score: string;
  getir_score: string;
  trendyol_yemek_score: string;
  franchise_owner: string;
  franchise_owner_phone: string;
  franchise_owner_email: string;
  invoice_address: string;
  selected_regional_managers: string[];
}

export default function RestoranDuzenlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [bolgeMudurleri, setBolgeMudurleri] = useState<BolgeMudur[]>([]);

  const [form, setForm] = useState<RestaurantForm>({
    name: "",
    city: "",
    district: "",
    address: "",
    phone: "",
    email: "",
    franchise: false,
    opening_date: "",
    manager_name: "",
    manager_user_id: "",
    status: "active",
    google_score: "0",
    yemeksepeti_score: "0",
    getir_score: "0",
    trendyol_yemek_score: "0",
    franchise_owner: "",
    franchise_owner_phone: "",
    franchise_owner_email: "",
    invoice_address: "",
    selected_regional_managers: [],
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Restoran bilgisi
      const { data: restData } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();

      if (restData) {
        const r = restData as Restaurant;
        setForm({
          name: r.name,
          city: r.city ?? "",
          district: r.district ?? "",
          address: r.address ?? "",
          phone: r.phone ?? "",
          email: r.email ?? "",
          franchise: r.franchise,
          opening_date: r.opening_date ?? "",
          manager_name: r.manager_name ?? "",
          manager_user_id: r.manager_user_id ?? "",
          status: r.status,
          google_score: r.google_score?.toString() ?? "0",
          yemeksepeti_score: r.yemeksepeti_score?.toString() ?? "0",
          getir_score: r.getir_score?.toString() ?? "0",
          trendyol_yemek_score: r.trendyol_yemek_score?.toString() ?? "0",
          franchise_owner: r.franchise_owner ?? "",
          franchise_owner_phone: r.franchise_owner_phone ?? "",
          franchise_owner_email: r.franchise_owner_email ?? "",
          invoice_address: r.invoice_address ?? "",
          selected_regional_managers: [],
        });
      }

      // Bölge müdürleri
      const { data: bmData } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("role", "bolge_muduru")
        .eq("status", "active");
      setBolgeMudurleri(bmData ?? []);

      // Mevcut bölge müdürü atamaları
      const { data: rrmData } = await supabase
        .from("restaurant_regional_managers")
        .select("regional_manager_user_id")
        .eq("restaurant_id", id);

      if (rrmData) {
        setForm((prev) => ({
          ...prev,
          selected_regional_managers: rrmData.map((rrm) => rrm.regional_manager_user_id),
        }));
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleChange = (field: keyof RestaurantForm, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setMessage("Restoran adı zorunludur");
      return;
    }

    setSaving(true);
    setMessage("");

    const restoranData = {
      name: form.name,
      city: form.city || null,
      district: form.district || null,
      address: form.address || null,
      phone: form.phone || null,
      email: form.email || null,
      franchise: form.franchise,
      opening_date: form.opening_date || null,
      manager_name: form.manager_name || null,
      manager_user_id: form.manager_user_id || null,
      status: form.status,
      google_score: parseFloat(form.google_score) || 0,
      yemeksepeti_score: parseFloat(form.yemeksepeti_score) || 0,
      getir_score: parseFloat(form.getir_score) || 0,
      trendyol_yemek_score: parseFloat(form.trendyol_yemek_score) || 0,
      franchise_owner: form.franchise_owner || null,
      franchise_owner_phone: form.franchise_owner_phone || null,
      franchise_owner_email: form.franchise_owner_email || null,
      invoice_address: form.invoice_address || null,
    };

    const { error } = await supabase
      .from("restaurants")
      .update(restoranData)
      .eq("id", id);

    if (error) {
      setMessage("Hata: " + error.message);
      setSaving(false);
      return;
    }

    // Bölge müdürü atamalarını güncelle
    await supabase
      .from("restaurant_regional_managers")
      .delete()
      .eq("restaurant_id", id);

    if (form.selected_regional_managers.length > 0) {
      await supabase.from("restaurant_regional_managers").insert(
        form.selected_regional_managers.map((userId) => ({
          restaurant_id: id,
          regional_manager_user_id: userId,
        }))
      );
    }

    setMessage("Restoran güncellendi ✅");
    setSaving(false);

    setTimeout(() => {
      router.push(`/firma-admin/restoranlar/${id}`);
    }, 1000);
  };

  if (loading) {
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
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          href={`/firma-admin/restoranlar/${id}`}
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
        >
          <FiArrowLeft size={14} />
          Geri
        </Link>
        <h4 className="fw-bold mb-0">Restoran Düzenle</h4>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Temel Bilgiler */}
            <div className="col-12">
              <h6 className="fw-bold text-primary mb-3">Temel Bilgiler</h6>
            </div>

            <div className="col-md-6">
              <label className="form-label small text-muted">Restoran Adı *</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">İl</label>
              <select
                className="form-select"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
              >
                <option value="">Seçiniz</option>
                {ILER.map((il: string) => (
                  <option key={il} value={il}>{il}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">İlçe</label>
              <input
                type="text"
                className="form-control"
                value={form.district}
                onChange={(e) => handleChange("district", e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small text-muted">Açılış Tarihi</label>
              <input
                type="date"
                className="form-control"
                value={form.opening_date}
                onChange={(e) => handleChange("opening_date", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted">Tür</label>
              <select
                className="form-select"
                value={form.franchise ? "franchise" : "merkez"}
                onChange={(e) => handleChange("franchise", e.target.value === "franchise")}
              >
                <option value="merkez">Merkeze Bağlı</option>
                <option value="franchise">Franchise</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted">Durum</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Aktif</option>
                <option value="passive">Pasif</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label small text-muted">Adres</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            {/* İletişim */}
            <div className="col-12 mt-4">
              <h6 className="fw-bold text-primary mb-3">İletişim</h6>
            </div>

            <div className="col-md-4">
              <label className="form-label small text-muted">Telefon</label>
              <input
                type="text"
                className="form-control"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted">E-posta</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted">Fatura Adresi</label>
              <input
                type="text"
                className="form-control"
                value={form.invoice_address}
                onChange={(e) => handleChange("invoice_address", e.target.value)}
              />
            </div>

            {/* Bölge Müdürü Atama */}
            <div className="col-12 mt-4">
              <h6 className="fw-bold text-primary mb-3">Bölge Müdürü Atama</h6>
            </div>

            <div className="col-md-6">
              <label className="form-label small text-muted">Bölge Müdürleri</label>
              <div className="border rounded-3 p-3" style={{ maxHeight: 180, overflowY: "auto" }}>
                {bolgeMudurleri.length === 0 ? (
                  <div className="small text-muted">Henüz bölge müdürü eklenmemiş.</div>
                ) : (
                  bolgeMudurleri.map((bm) => (
                    <div className="form-check" key={bm.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`bm-${bm.id}`}
                        checked={form.selected_regional_managers.includes(bm.id)}
                        onChange={() => {
                          const updated = form.selected_regional_managers.includes(bm.id)
                            ? form.selected_regional_managers.filter((id) => id !== bm.id)
                            : [...form.selected_regional_managers, bm.id];
                          handleChange("selected_regional_managers", updated);
                        }}
                      />
                      <label className="form-check-label small" htmlFor={`bm-${bm.id}`}>
                        {bm.full_name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small text-muted">Restoran Müdürü</label>
              <input
                type="text"
                className="form-control"
                value={form.manager_name}
                onChange={(e) => handleChange("manager_name", e.target.value)}
              />
            </div>

            {/* Platform Puanları */}
            <div className="col-12 mt-4">
              <h6 className="fw-bold text-primary mb-3">Platform Puanları (0-5)</h6>
            </div>

            <div className="col-md-3">
              <label className="form-label small text-muted">Google Puanı</label>
              <input
                type="number"
                className="form-control"
                step="0.1"
                min="0"
                max="5"
                value={form.google_score}
                onChange={(e) => handleChange("google_score", e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Yemek Sepeti Puanı</label>
              <input
                type="number"
                className="form-control"
                step="0.1"
                min="0"
                max="5"
                value={form.yemeksepeti_score}
                onChange={(e) => handleChange("yemeksepeti_score", e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Getir Puanı</label>
              <input
                type="number"
                className="form-control"
                step="0.1"
                min="0"
                max="5"
                value={form.getir_score}
                onChange={(e) => handleChange("getir_score", e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">Trendyol Yemek Puanı</label>
              <input
                type="number"
                className="form-control"
                step="0.1"
                min="0"
                max="5"
                value={form.trendyol_yemek_score}
                onChange={(e) => handleChange("trendyol_yemek_score", e.target.value)}
              />
            </div>

            {/* Franchise Bilgileri */}
            {form.franchise && (
              <>
                <div className="col-12 mt-4">
                  <h6 className="fw-bold text-primary mb-3">Franchise Bilgileri</h6>
                </div>

                <div className="col-md-4">
                  <label className="form-label small text-muted">Restoran Sahibi</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.franchise_owner}
                    onChange={(e) => handleChange("franchise_owner", e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small text-muted">Sahip İletişim No</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.franchise_owner_phone}
                    onChange={(e) => handleChange("franchise_owner_phone", e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small text-muted">Sahip E-posta</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.franchise_owner_email}
                    onChange={(e) => handleChange("franchise_owner_email", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {message && (
            <div className={`alert mt-3 ${message.includes("✅") ? "alert-success" : "alert-danger"} py-2 small`}>
              {message}
            </div>
          )}

          <div className="d-flex gap-2 mt-4">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
            <Link
              href={`/firma-admin/restoranlar/${id}`}
              className="btn btn-secondary"
            >
              İptal
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}