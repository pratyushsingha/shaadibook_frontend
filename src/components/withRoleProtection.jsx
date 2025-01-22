'use client';

import { useEffect } from "react";
import useAuth from "@/store/useAuth";
import Loader from "@/components/loader/Loader";
import { useRouter } from "next/navigation";

export const withRoleProtection = (Component, allowedRoles = []) => {
  return (props) => {
    const { role, isAuthenticated, initializeAuth, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        initializeAuth();
      }
    }, [isAuthenticated, initializeAuth, loading]);

    useEffect(() => {
      if (!loading && isAuthenticated && !allowedRoles.includes(role)) {
        router.push("/login");
      }
    }, [isAuthenticated, role, loading]);

    if (loading) {
      return <Loader />;
    }

    if (!loading && !isAuthenticated) {
      router.push("/login");
    }

    return <Component {...props} />;
  };
};
