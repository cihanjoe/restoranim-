"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiEdit2,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiStar,
  FiUser,
  FiHome,
  FiFileText,
} from "react-icons/fi";

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

export default function RestoranDetayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [regionalManagers, setRegionalManagers] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: restData } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();

      if (restData) setRestaurant(restData as Restaurant);

      const { data: rrmData } = await supabase
        .from("restaurant_regional_managers")
        .select("regional_manager_user_id")
        .eq("restaurant_id", id);

      if (rrmData) {
        const userIds = rrmData.map((r) => r.regional_manager_user_id);

        if (userIds.length > 0) {
          const { data: userData } = await supabase
            .from("users")
            .select("full_name")
            .in("id", userIds);

          if (userData) {
            setRegionalManagers(userData.map((u) => u.full_name));
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const formatScore = (val: number | null) => {
    if (val === null || val === undefined) return "—";
    return val.toFixed(1);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

  if (!restaurant) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">Restoran bulunamadı.</h5>
        <Link href="/firma-admin/restoranlar" className="btn btn-outline-primary mt-3">
          Geri Dön
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link
            href="/firma-admin/restoranlar"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          >
            <FiArrowLeft size={14} />
            Geri
          </Link>
          <div>
            <h4 className="fw-bold mb-1">{restaurant.name}</h4>
            <span className={`badge ${restaurant.status === "active" ? "bg-success" : "bg-secondary"}`}>
              {restaurant.status === "active" ? "Aktif" : "Pasif"}
            </span>
            {restaurant.franchise && (
              <span className="badge bg-info bg-opacity-10 text-info ms-2">Franchise</span>
            )}
          </div>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => router.push(`/firma-admin/restoranlar/${id}/duzenle`)}
        >
          <FiEdit2 size={16} />
          Düzenle
        </button>
      </div>

      <div className="row g-4">
        {/* Sol Sütun — Temel Bilgiler */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-transparent border-bottom">
              <h5 className="fw-bold mb-0">Temel Bilgiler</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-start gap-2">
                    <FiHome className="text-muted mt-1" size={16} />
                    <div>
                      <div className="small text-muted">Restoran Adı</div>
                      <div className="fw-semibold">{restaurant.name}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-start gap-2">
                    <FiCalendar className="text-muted mt-1" size={16} />
                    <div>
                      <div className="small text-muted">Açılış Tarihi</div>
                      <div className="fw-semibold">{formatDate(restaurant.opening_date)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-start gap-2">
                    <FiUser className="text-muted mt-1" size={16} />
                    <div>
                      <div className="small text-muted">Tür</div>
                      <div className="fw-semibold">{restaurant.franchise ? "Franchise" : "Merkeze Bağlı"}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-start gap-2">
                    <FiMapPin className="text-muted mt-1" size={16} />
                    <div>
                      <div className="small text-muted">Lokasyon</div>
                      <div className="fw-semibold">
                        {[restaurant.city, restaurant.district].filter(Boolean).join(" / ") || "Belirtilmemiş"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex align-items-start gap-2">
                    <FiFileText className="text-muted mt-1" size={16} />
                    <div>
                      <div className="small text-muted">Adres</div>
                      <div className="fw-semibold">{restaurant.address || "Belirtilmemiş"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-transparent border-bottom">
              <h5 className="fw-bold mb-0">İletişim</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="d-flex align-items-start gap-2">
                    <FiPhone className="text-muted mt-1" size={16} />
                    <div>
                      <div className="small text-muted">Telefon</div>
                      <div className="fw-semibold">{restaurant.phone || "Belirtilmemiş"}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start gap-2">
                    <FiMail className="text-muted mt-1" size={16} />
                    <div>
                      <div className="small text-muted">E-posta</div>
                      <div className="fw-semibold">{restaurant.email || "Belirtilmemiş"}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-start gap-2">
                    <FiFileText className="text-muted mt-1" size={16} />
                    <div>
                      <div className="small text-muted">Fatura Adresi</div>
                      <div className="fw-semibold">{restaurant.invoice_address || "Belirtilmemiş"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bölge Müdürleri */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-transparent border-bottom">
              <h5 className="fw-bold mb-0">Bölge Müdürleri</h5>
            </div>
            <div className="card-body">
              {regionalManagers.length === 0 ? (
                <div className="text-muted small">Henüz bölge müdürü atanmamış.</div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {regionalManagers.map((name, i) => (
                    <span key={i} className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Restoran Müdürü */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-transparent border-bottom">
              <h5 className="fw-bold mb-0">Restoran Müdürü</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center gap-2">
                <FiUser className="text-muted" size={16} />
                <span className="fw-semibold">{restaurant.manager_name || "Belirtilmemiş"}</span>
              </div>
            </div>
          </div>

          {/* Franchise Bilgileri */}
          {restaurant.franchise && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-transparent border-bottom">
                <h5 className="fw-bold mb-0">Franchise Bilgileri</h5>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="small text-muted">Restoran Sahibi</div>
                    <div className="fw-semibold">{restaurant.franchise_owner || "Belirtilmemiş"}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="small text-muted">Sahip İletişim No</div>
                    <div className="fw-semibold">{restaurant.franchise_owner_phone || "Belirtilmemiş"}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="small text-muted">Sahip E-posta</div>
                    <div className="fw-semibold">{restaurant.franchise_owner_email || "Belirtilmemiş"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sağ Sütun — Puanlar */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-transparent border-bottom">
              <h5 className="fw-bold mb-0">Platform Puanları</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small">Google</span>
                  <span className="badge bg-warning bg-opacity-10 text-warning fs-6">
                    {formatScore(restaurant.google_score)}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small">Yemek Sepeti</span>
                  <span className="badge bg-danger bg-opacity-10 text-danger fs-6">
                    {formatScore(restaurant.yemeksepeti_score)}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small">Getir</span>
                  <span className="badge bg-success bg-opacity-10 text-success fs-6">
                    {formatScore(restaurant.getir_score)}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small">Trendyol Yemek</span>
                  <span className="badge bg-info bg-opacity-10 text-info fs-6">
                    {formatScore(restaurant.trendyol_yemek_score)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-bottom">
              <h5 className="fw-bold mb-0">Özet</h5>
            </div>
            <div className="card-body">
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Durum</span>
                  <span className={`badge ${restaurant.status === "active" ? "bg-success" : "bg-secondary"}`}>
                    {restaurant.status === "active" ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tür</span>
                  <span>{restaurant.franchise ? "Franchise" : "Merkez"}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Kayıt Tarihi</span>
                  <span>{formatDate(restaurant.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}