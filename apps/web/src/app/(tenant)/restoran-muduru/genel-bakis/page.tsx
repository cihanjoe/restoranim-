"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatCard } from "@/components/hope-ui/widgets";

interface ActionItem {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  opened_at: string;
}

interface VisitInfo {
  visit_date: string;
  overall_score: number | null;
}

interface RestaurantInfo {
  id: string;
  name: string;
  address: string;
  manager_name: string;
  total_staff_count: number;
  phone: string | null;
}

export default function RestoranMuduruGenelBakisPage() {
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [openActions, setOpenActions] = useState<ActionItem[]>([]);
  const [lastVisit, setLastVisit] = useState<VisitInfo | null>(null);
  const [openActionCount, setOpenActionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      const uid = session.user.id;

      // 1) Bu kullanıcının yönettiği restoranı bul
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("id, name, address, manager_name, total_staff_count, phone")
        .eq("restaurant_manager_user_id", uid)
        .single();

      if (!restaurantData) {
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);

      // 2) Açık aksiyonlar
      const { data: actionsData } = await supabase
        .from("actions")
        .select("id, title, status, due_date, opened_at")
        .eq("restaurant_id", restaurantData.id)
        .in("status", ["open", "pending_approval"])
        .order("opened_at", { ascending: false })
        .limit(10);

      if (actionsData) {
        setOpenActions(actionsData);
        setOpenActionCount(actionsData.length);
      }

      // 3) Son ODZ ziyareti
      const { data: visitData } = await supabase
        .from("odz_visits")
        .select("visit_date, overall_score")
        .eq("restaurant_id", restaurantData.id)
        .order("visit_date", { ascending: false })
        .limit(1)
        .single();

      if (visitData) {
        setLastVisit(visitData);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

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
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-5 text-center">
          <p className="text-muted mb-0">
            Size atanmış bir restoran bulunamadı. Lütfen firma yöneticinizle iletişime geçin.
          </p>
        </div>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      open: { label: "Açık", cls: "bg-warning" },
      pending_approval: { label: "Onay Bekliyor", cls: "bg-info" },
    };
    const s = map[status] ?? { label: status, cls: "bg-secondary" };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  return (
    <>
      {/* Özet Kartlar */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10"
                  style={{ width: 56, height: 56 }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <div className="small text-muted mb-1">Restoran</div>
                  <div className="h5 fw-bold text-dark mb-0">{restaurant.name}</div>
                  <div className="small text-muted">{restaurant.address}</div>
                </div>
              </div>
              <div className="mt-3 d-flex gap-3 small text-muted">
                <span>📞 {restaurant.phone ?? "-"}</span>
                <span>👤 {restaurant.manager_name ?? "-"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <StatCard
            color="info"
            progress={restaurant.total_staff_count > 0 ? 100 : 0}
            title="Personel Sayısı"
            value={String(restaurant.total_staff_count)}
            change="Kayıtlı"
          />
        </div>

        <div className="col-12 col-md-3">
          <StatCard
            color="warning"
            progress={openActionCount > 0 ? Math.min(openActionCount * 20, 100) : 0}
            title="Açık Aksiyon"
            value={String(openActionCount)}
            change={openActionCount > 0 ? "Bekleyen" : "Temiz"}
            trend={openActionCount > 0 ? "down" : undefined}
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Son ODZ Ziyareti */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-bottom-0 pt-4 px-4">
              <h5 className="fw-bold text-dark mb-0">Son ODZ Ziyareti</h5>
            </div>
            <div className="card-body p-4">
              {lastVisit ? (
                <div className="d-flex flex-column align-items-center text-center py-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-3"
                    style={{ width: 80, height: 80 }}
                  >
                    <span className="h3 fw-bold text-success mb-0">
                      {lastVisit.overall_score ?? "—"}
                    </span>
                  </div>
                  <div className="small text-muted">
                    {new Date(lastVisit.visit_date).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="small text-muted">
                    Genel Puan
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <p className="mb-0 fst-italic">Henüz ODZ ziyareti yapılmadı</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Son Aksiyonlar */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-bottom-0 pt-4 px-4">
              <h5 className="fw-bold text-dark mb-0">Açık Aksiyonlar</h5>
            </div>
            <div className="card-body p-4">
              {openActions.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {openActions.map((a) => (
                    <div key={a.id} className="d-flex align-items-start gap-3 pb-3 border-bottom">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 flex-shrink-0"
                        style={{ width: 36, height: 36 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffc107" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="fw-semibold small text-dark">{a.title}</div>
                          {statusBadge(a.status)}
                        </div>
                        <div className="small text-muted mt-1">
                          {a.due_date
                            ? `Son tarih: ${new Date(a.due_date).toLocaleDateString("tr-TR")}`
                            : `Oluşturulma: ${new Date(a.opened_at).toLocaleDateString("tr-TR")}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <p className="mb-0 fst-italic">Açık aksiyon bulunmuyor</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}