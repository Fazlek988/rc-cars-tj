
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function validSecret(provided: string | null) {
  const expected = process.env.ORDER_RETRY_SECRET;

  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!validSecret(request.headers.get("x-retry-secret"))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { error: "Telegram is not configured" },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, customer_name, phone, whatsapp, address, total_amount"
    )
    .eq("telegram_sent", false)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Retry query failed:", error);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }

  let sent = 0;
  let failed = 0;

  for (const order of orders ?? []) {
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit_price, subtotal")
      .eq("order_id", order.id);

    if (itemsError || !items) {
      failed++;
      continue;
    }

    const lines = items.map(
      (item) =>
        `${item.product_name} — ${item.quantity} дона × ${item.unit_price} = ${item.subtotal} сомонӣ`
    );

    const message = [
      "🛒 НОВЫЙ ЗАКАЗ — RC.CARS_TJ",
      "🔁 Повторная отправка уведомления",
      "",
      `🆔 Заказ: ${order.id}`,
      `👤 Клиент: ${order.customer_name}`,
      `📞 Телефон: ${order.phone}`,
      `💬 WhatsApp: ${order.whatsapp || "Не указан"}`,
      `📍 Адрес: ${order.address || "Не указан"}`,
      "",
      "📦 ТОВАРЫ:",
      ...lines,
      "",
      `💰 ИТОГО: ${order.total_amount} сомони`,
    ].join("\n");

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
          signal: AbortSignal.timeout(15000),
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || result.ok !== true) {
        failed++;
        continue;
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update({ telegram_sent: true })
        .eq("id", order.id);

      if (updateError) {
        console.error("Retry status update failed:", updateError);
        failed++;
        continue;
      }

      sent++;
    } catch (err) {
      console.error("Telegram retry failed:", err);
      failed++;
    }
  }

  return NextResponse.json({
    success: true,
    checked: orders?.length ?? 0,
    sent,
    failed,
  });
}
