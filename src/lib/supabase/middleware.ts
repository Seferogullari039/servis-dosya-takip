import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/login";
  const isSetupPage = pathname === "/setup";
  const isPublicLegal =
    pathname === "/kvkk" || pathname === "/gizlilik" || pathname === "/offline";
  const isCorporateHome = pathname === "/";
  const isProtected =
    !isSetupPage &&
    !isPublicLegal &&
    !isLoginPage &&
    !isCorporateHome &&
    (pathname.startsWith("/dosyalar") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/ozet") ||
      pathname.startsWith("/is-emir") ||
      pathname.startsWith("/tedarik") ||
      pathname.startsWith("/kullanicilar") ||
      pathname.startsWith("/yedekleme") ||
      pathname.startsWith("/islem-gecmisi"));

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("reason", "auth_required");
    if (pathname !== "/") {
      redirectUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      request.nextUrl.searchParams.get("redirect") || "/ozet";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
