// app/cambiar-pasword/layout.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import AdminLoading from "@/components/AdminLoading";

export default function CambiarPasswordLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMe().then((user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    });
  }, [router]);

  if (checking) return <AdminLoading />;

  return <>{children}</>;
}
