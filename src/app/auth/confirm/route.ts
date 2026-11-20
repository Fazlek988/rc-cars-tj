
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!tokenHash || type !== "invite") {
    return NextResponse.redirect(
      new URL("/admin/login", origin)
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "invite",
  });

  if (error) {
    console.error("Invitation verification failed:", error.message);

    return NextResponse.redirect(
      new URL("/admin/login", origin)
    );
  }

  return NextResponse.redirect(
    new URL("/admin/accept-invite", origin)
  );
}



