"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserData {
  id: string;
  full_name: string;
  role: string;
  email: string;
  photo_url?: string | null;
  tenant_id?: string | null;
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("id, full_name, role, email, photo_url, tenant_id")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setUser(data);
      }
      setLoading(false);
    }

    fetchUser();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return { user, loading, getInitials };
}