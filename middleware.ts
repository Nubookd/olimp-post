import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public
  const isPublicPath = (pathname: string): boolean => {
    const publicPath = [
      "/",
      "/login",
      "/logout",
      "/api/catalog",
      "/api/auth/login",
      "/api/auth/logout",
      "/api/auth/refresh",
      "/api/test",
    ];

    return publicPath.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  };

  // Auth paths (только для неавторизованных)
  const isAuthPath = (pathname: string): boolean => {
    const authPaths = ["/login", "/register", "/forgot-password"];

    return authPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  };

  // Admin
  const isDispatcherPath = (pathname: string): boolean => {
    const dispatcherPath = [
      "/admin",
      "/api/admin",
      "/api/dispatcher/orders",
      "/api/dispatcher/users",
    ];

    return dispatcherPath.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  };

  // Moder
  const isModerPath = (pathname: string): boolean => {
    const moderPath = ["moder"];

    return moderPath.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  };

  // Protected paths (требуют любой авторизации)
  const isProtectedPath = (pathname: string): boolean => {
    if (pathname.startsWith("/(auth)/")) {
      return true;
    }
    const protectedPaths = ["/dashboard", "/api/dashboard", "/api/geocode"];

    return protectedPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  };

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const isAuthenticated = !!(accessToken || refreshToken);

  // Проверка
  if (isPublicPath(pathname) && !isAuthPath(pathname)) {
    return NextResponse.next();
  } else {
    if (isAuthPath(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard/profile", request.url));
    } else if (isProtectedPath(pathname)) {
      try {
        const accessToken = request.cookies.get("access_token")?.value;
        const ACCESS_SECRET = new TextEncoder().encode(
          process.env.ACCESS_SECRET!,
        );
        if (!accessToken) {
          const refreshToken = request.cookies.get("refresh_token")?.value;
          if (refreshToken) {
            try {
              const REFRESH_SECRET = new TextEncoder().encode(
                process.env.REFRESH_SECRET!,
              );

              const { payload } = await jwtVerify(
                refreshToken,
                REFRESH_SECRET,
                {
                  algorithms: ["HS256"],
                  clockTolerance: 30,
                },
              );
              if (payload.type !== "refresh")
                return NextResponse.redirect(
                  new URL("/login", request.url),
                  307,
                );
              if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000))
                return NextResponse.redirect(
                  new URL("/login", request.url),
                  307,
                );
              if (!payload.userId)
                return NextResponse.redirect(
                  new URL("/login", request.url),
                  307,
                );

              return NextResponse.next();
            } catch {
              return false;
            }
          }
          return NextResponse.redirect(new URL("/login", request.url), 307);
        }
        const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
        if (!payload) {
          return NextResponse.redirect(
            new URL("/api/auth/refresh", request.url),
            307,
          );
        }
        if (isAuthenticated) {
          if (isDispatcherPath(pathname)) {
            if (payload.role === "DISPATCHER" || payload.role === "ADMIN") {
              return NextResponse.next();
            } else if (
              payload.role === "MODER" ||
              payload.role === "CUSTOMER"
            ) {
              return NextResponse.redirect(
                new URL("/dashboard/profile", request.url),
                307,
              );
            } else {
              return NextResponse.redirect(new URL("/login", request.url), 307);
            }
          } else if (isModerPath(pathname)) {
            if (payload.role === "ADMIN" || payload.role === "DISPATCHER") {
              return NextResponse.next();
            } else {
              return NextResponse.redirect(new URL("/login", request.url), 307);
            }
          } else {
            console.log("pepe");
            return NextResponse.next();
          }
        } else {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      } catch (error) {
        console.error("Auth middleware error:", error);
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }
}

export const config = {
  matcher: ["/((?!_next|api/auth|favicon.ico|public|fonts|images|assets).*)"],
};
