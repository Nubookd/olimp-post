"use client";

import { formatZodError } from "@/lib/utils/zod-error-formatter";
import { LoginUserSchema } from "@/lib/validators/auth.validator";
import { IClientResponse, IUserPublicData } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<IUserPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const login = useCallback(
    async (userData: unknown): Promise<IClientResponse> => {
      setError(null);
      setLoading(true);
      const isValidData = LoginUserSchema.safeParse(userData);
      if (!isValidData.success) {
        const formattedError = formatZodError(isValidData.error);
        return formattedError;
      }
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isValidData.data),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          return {
            success: true,
            message: data.message,
            status: data.status || 200,
          };
        } else {
          setError(data.message);
          return {
            success: false,
            message: data.message,
            status: data.status || 401,
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Ошибка входа";
        setError(message);
        return { success: false, message, status: 500 };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<IClientResponse> => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        setError(null);
        return {
          success: true,
          message: data.message,
          status: data.status || 200,
        };
      } else {
        setError(data.message);
        return {
          success: false,
          message: data.message,
          status: data.status || 500,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка входа";
      setError(message);
      return { success: false, message, status: 500 };
    }
  }, []);

  const checkAuth = useCallback(async (): Promise<IClientResponse> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setError(null);
      } else {
        setUser(null);
        if (data.canRefresh) {
          const isRefresh = await refreshTokens();
          if (isRefresh.success) {
            await checkAuth();
          }
        }
      }
      return {
        success: data.success,
        message: data.message,
        status: data.status,
        user: data.user,
      };
    } catch (error) {
      setUser(null);
      return {
        success: false,
        message: "Внутренняя ошибка сервера | hook",
        status: 500,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      return {
        success: data.success,
        message: data.message,
        status: data.status,
      };
    } catch (error) {
      return {
        success: false,
        message: "Внутренняя ошибка сервера | hook",
        status: 500,
      };
    }
  }, []);
  useEffect(() => {
    const post = async () => {
      await checkAuth();
    };
    post();
  }, [checkAuth]);
  return {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };
}
