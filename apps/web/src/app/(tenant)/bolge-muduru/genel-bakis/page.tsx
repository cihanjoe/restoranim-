"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatCard } from "@/components/hope-ui/widgets";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  manager_name: string;
  total_staff_count: number;
  status: string;
  last_visit_date: string | null;
}

export default function BolgeMuduruGenelBakisPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    visitsThisMonth: 0,
    openActions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      const uid = session.user.id;
      setUserId(uid);

      // 1) Atanan restoranları çek
      const { data: assignmentData } = await supabase
        .from("restaurant_regional_managers")
        .select("restaurant_id")
        .eq("regional_manager_user_id", uid);

      if (!assignmentData || assignmentData.length === 0) {
        setLoading(false);
        return;
      }

      const restaurantIds = assignmentData.map((a) => a.restaurant_id);

      // 2) Restoran detaylarını çek
      const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("id, name, address, manager_name, total_staff_count, status")
        .in("id", restaurantIds);

      if (restaurantData) {
        // 3) Her restoran için son ziyaret tarihini çek
        const restaurantsWithVisits: Restaurant[] = await Promise.all(
          restaurantData.map(async (r) => {
            const { data: visitData } = await supabase
              .from("odz_visits")
              .select("visit_date")
              .eq("restaurant_id", r.id)
              .eq("regional_manager_user_id", uid)
              .order("visit_date", { ascending: false })
              .limit(1)
              .single();

            return {
              id: r.id,
              name: r.name,
              address: r.address ?? "",
              manager_name: r.manager_name ?? "",
              total_staff_count: r.total_staff_count ?? 0,
              status: r.status ?? "active",
              last_visit_date: visitData?.visit_date ?? null,
            };
          })
        );
        setRestaurants(restaurantsWithVisits);
      }

      // 4) Bu ay yapılan ziyaret sayısı
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count: visitCount } = await supabase
        .from("odz_visits")
        .select("*", { count: "exact", head: true })
        .eq("regional_manager_user_id", uid)
        .gte("visit_date", monthStart);

      // 5) Açık aksiyon sayısı (restoran_ids üzerinden)
      const { count: actionCount } = await supabase
        .from("actions")
        .select("*", { count: "exact", head: true })
        .in("restaurant_id", restaurantIds)
        .eq("status", "open");

      setStats({
        totalRestaurants: restaurantIds.length,
        visitsThisMonth: visitCount ?? 0,
        openActions: actionCount ?? 0,
      });

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

  return (
    <>
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <StatCard
            color="primary"
            progress={stats.totalRestaurants > 0 ? 100 : 0}
            title="Atanan Restoran"
            value={String(stats.totalRestaurants)}
            change="Toplam"
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            color="info"
            progress={stats.visitsThisMonth > 0 ? 60 : 0}
            title="Bu Ay Ziyaret"
            value={String(stats.visitsThisMonth)}
            change="Görüntüle"
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            color="warning"
            progress={stats.openActions > 0 ? Math.min(stats.openActions * 10, 100) : 0}
            title="Açık Aksiyon"
            value={String(stats.openActions)}
            change={stats.openActions > 0 ? "Aksiyon Gerekli" : "Temiz"}
            trend={stats.openActions > 0 ? "down" : undefined}
          />
        </div>
      </div>

      {restaurants.length > 0 ? (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="h5 fw-bold text-dark mb-1">Atanan Restoranlar</h2>
                <p className="text-muted small mb-0">
                  Size atanan {stats.totalRestaurants} restoran
                </p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Restoran Adı</th>
                    <th>Adres</th>
                    <th>Müdür</th>
                    <th>Personel</th>
                    <th>Son Ziyaret</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-semibold text-dark">{r.name}</td>
                      <td className="text-muted small">{r.address}</td>
                      <td>{r.manager_name}</td>
                      <td>{r.total_staff_count}</td>
                      <td>
                        {r.last_visit_date
                          ? new Date(r.last_visit_date).toLocaleDateString("tr-TR")
                          : <span className="text-muted fst-italic">Henüz ziyaret yok</span>}
                      </td>
                      <td>
                        <span className={`badge ${r.status === "active" ? "bg-success" : "bg-secondary"}`}>
                          {r.status === "active" ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-5 text-center">
            <p className="text-muted mb-0">
              Size henüz hiçbir restoran atanmamış. Lütfen firma yöneticinizle iletişime geçin.
            </p>
          </div>
        </div>
      )}
    </>
  );
}