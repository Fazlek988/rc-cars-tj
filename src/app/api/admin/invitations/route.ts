
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Необходимо войти в админ-панель" },
        { status: 401 }
      );
    }

    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (staffError || staff?.role !== "owner") {
      return NextResponse.json(
        { error: "Только владелец может приглашать администраторов" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const email = body?.email;

    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { error: "Укажи корректный email" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = createAdminClient();

    const { data: existing, error: lookupError } = await admin
      .from("admin_invitations")
      .select("email, accepted_at, expires_at")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      console.error("Invitation lookup error:", lookupError.message);
      return NextResponse.json(
        { error: "Не удалось проверить приглашение" },
        { status: 500 }
      );
    }

    if (
      existing &&
      (existing.accepted_at ||
        new Date(existing.expires_at).getTime() > Date.now())
    ) {
      return NextResponse.json(
        {
          error: existing.accepted_at
            ? "Этот сотрудник уже принял приглашение"
            : "На этот email уже создано приглашение",
        },
        { status: 409 }
      );
    }

    const { error: registryError } = await admin
      .from("admin_invitations")
      .upsert(
        {
          email: normalizedEmail,
          invited_by: user.id,
          accepted_at: null,
          expires_at: new Date(
            Date.now() + 48 * 60 * 60 * 1000
          ).toISOString(),
        },
        { onConflict: "email" }
      );

    if (registryError) {
      console.error("Invitation registry error:", registryError.message);
      return NextResponse.json(
        { error: "Не удалось зарегистрировать приглашение" },
        { status: 500 }
      );
    }

    const { error: inviteError } =
  await admin.auth.admin.inviteUserByEmail(
    normalizedEmail,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/accept-invite`,
    }
  );

    if (inviteError) {
      console.error("Admin invitation error:", inviteError.message);

      const { error: cleanupError } = await admin
        .from("admin_invitations")
        .update({ expires_at: new Date(0).toISOString() })
        .eq("email", normalizedEmail)
        .eq("invited_by", user.id)
        .is("accepted_at", null);

      if (cleanupError) {
        console.error("Invitation cleanup error:", cleanupError.message);
      }

      return NextResponse.json(
        { error: "Не удалось отправить приглашение" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Приглашение отправлено на email",
    });
  } catch (error) {
    console.error("Admin invitation failed:", error);
    return NextResponse.json(
      { error: "Ошибка отправки приглашения" },
      { status: 500 }
    );
  }
}
