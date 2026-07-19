"use client";
/**
 * useAuth — Hook global de autenticación.
 * Lee el perfil del usuario logueado desde /auth/me y lo expone
 * para control de acceso basado en rol en cualquier componente.
 */
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

let _profileCache = null;

export function useAuth() {
  const [user, setUser] = useState(_profileCache);
  const [loading, setLoading] = useState(!_profileCache);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      _profileCache = res.data;
      setUser(res.data);
    } catch {
      _profileCache = null;
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_profileCache) fetchProfile();
    else setLoading(false);
  }, [fetchProfile]);

  const refreshProfile = () => {
    _profileCache = null;
    fetchProfile();
  };

  const isAdmin = user?.rol === "ADMIN";
  const isOperador = user?.rol === "OPERADOR";
  const isAuditor = user?.rol === "AUDITOR" || user?.rol === "SOLO_LECTURA";
  const canWrite = isAdmin || isOperador;

  return { user, loading, isAdmin, isOperador, isAuditor, canWrite, refreshProfile };
}
