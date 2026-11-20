
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "new",
  "processing",
  "completed",
  "cancelled",
];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  // Проверяем, вошёл ли пользователь в систему
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Необходима авторизация" },
      { status: 401 }
    );
  }

  // Проверяем роль администратора
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (
    staffError ||
    !staff ||
    !["owner", "admin"].includes(staff.role)
  ) {
    return NextResponse.json(
      { error: "Недостаточно прав" },
      { status: 403 }
    );
  }

  // Получаем ID заказа
  const { id } = await context.params;

  // Получаем новый статус
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректный JSON" },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("status" in body) ||
    typeof body.status !== "string" ||
    !allowedStatuses.includes(body.status)
  ) {
    return NextResponse.json(
      { error: "Недопустимый статус заказа" },
      { status: 400 }
    );
  }

  // Обновляем статус заказа
  const { data, error } = await supabase
    .from("orders")
    .update({ status: body.status })
    .eq("id", id)
    .select("id, status")
    .single();

  
if (error) {
  console.error("Ошибка Supabase при обновлении заказа:", error);

  return NextResponse.json(
    { error: "Не удалось обновить статус заказа" },
    { status: 500 }
  );
}

  return NextResponse.json({
    success: true,
    order: data,
  });
}
