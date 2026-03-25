import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/compliance/:path*",
    "/api/compliance-actions/:path*",
    "/api/export/:path*",
    "/api/history/:path*",
    "/api/ledger/:path*",
    "/api/mapping/:path*",
    "/api/obligations/:path*",
    "/api/obligations-globales/:path*",
    "/api/organization/:path*",
    "/api/storage/:path*",
    "/api/suivi/:path*",
    "/api/systems/:path*",
    "/api/uploads/:path*",
    "/api/usecases/:path*",
    "/api/users/:path*",
    "/api/vue-controleur/:path*",
  ],
};