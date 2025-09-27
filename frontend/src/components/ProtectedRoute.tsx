"use client";

import { useUserStore } from "@/store/userStore";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useUserStore();
  const router = useRouter();
  //@ts-ignore
  const profile: User = user?.user;

  useEffect(() => {
    if (!profile) {
      router.replace("/login");
    }
  }, [profile, router]);

  if (!profile) {
    return null;
  }

  if (!profile) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
