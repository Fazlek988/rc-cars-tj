
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      whatsapp,
      address,
      items,
      checkout_key,
    } = body;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 100 ||
      typeof phone !== "string" ||
      !phone.trim() ||
      phone.length > 30 ||
      typeof whatsapp !== "string" ||
      whatsapp.length > 30 ||
      typeof address !== "string" ||
      address.length > 300 ||
      typeof checkout_key !== "string" ||
      !uuidPattern.test(checkout_key) ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 30
    ) {
      return NextResponse.json(
        { error: "Маълумоти фармоиш нодуруст аст" },
        { status: 400 }
      );
    }

    const quantities = new Map<string, number>();

    for (const item of items) {
      if (
        !item ||
        typeof item.id !== "string" ||
        !uuidPattern.test(item.id) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return NextResponse.json(
          { error: "Маълумоти маҳсулот нодуруст аст" },
          { status: 400 }
        );
      }

      const quantity =
        (quantities.get(item.id) ?? 0) + item.quantity;

      if (quantity > 100) {
        return NextResponse.json(
          { error: "Миқдори маҳсулот зиёд аст" },
          { status: 400 }
        );
      }

      quantities.set(item.id, quantity);
    }

    const supabase = createAdminClient();

    // Сохраняем заказ и товары одной транзакцией.
    const { data: orderId, error: orderError } =
      await supabase.rpc("create_shop_order", {
        p_customer_name: name.trim(),
        p_phone: phone.trim(),
        p_whatsapp: whatsapp.trim(),
        p_address: address.trim(),
        p_items: [...quantities].map(([id, quantity]) => ({
          id,
          quantity,
        })),
        p_checkout_key: checkout_key,
      });

   if (orderError || !orderId) {
  console.error("Order database error:", orderError);

  const errorMessage = orderError?.message ?? "";

  if (errorMessage.includes("SHOP_ORDERS_DISABLED")) {
    return NextResponse.json(
      {
        error:
          "Қабули фармоишҳо муваққатан қатъ шудааст. Лутфан дертар кӯшиш кунед.",
      },
      { status: 403 }
    );
  }

  if (errorMessage.includes("SHOP_MINIMUM_ORDER_AMOUNT")) {
    return NextResponse.json(
      {
        error:
          "Маблағи фармоиши шумо аз ҳадди ақали муқарраршуда камтар аст.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Фармоиш сабт нашуд. Дубора кӯшиш кунед." },
    { status: 500 }
  );
}

    // Проверяем, отправляли ли уведомление ранее.
    const { data: order, error: readError } = await supabase
      .from("orders")
      .select(
        "id, customer_name, phone, whatsapp, address, total_amount, telegram_sent"
      )
      .eq("id", orderId)
      .single();

    const { data: orderItems, error: itemsError } =
      await supabase
        .from("order_items")
        .select("product_name, quantity, unit_price, subtotal")
        .eq("order_id", orderId);

    if (readError || itemsError || !order || !orderItems) {
      console.error("Order read error:", readError, itemsError);

      // Заказ уже сохранён, поэтому не просим покупателя
      // оформлять его повторно.
      return NextResponse.json({
        success: true,
        order_id: orderId,
        telegram_sent: false,
      });
    }

    if (!order.telegram_sent) {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (token && chatId) {
        const lines = orderItems.map(
          (item) =>
            `${item.product_name} — ${item.quantity} дона × ${item.unit_price} = ${item.subtotal} сомонӣ`
        );

        const message = [
          "🛒 НОВЫЙ ЗАКАЗ — RC.CARS_TJ",
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
              signal: AbortSignal.timeout(8000),
              cache: "no-store",
            }
          );

          const result = await response.json();

          if (response.ok && result.ok) {
            const { error: updateError } = await supabase
              .from("orders")
              .update({ telegram_sent: true })
              .eq("id", orderId);

            if (updateError) {
              console.error(
                "Telegram status update failed:",
                updateError
              );
            }
          } else {
            console.error(
              "Telegram rejected notification:",
              response.status
            );
          }
        } catch (telegramError) {
          console.error(
            "Telegram notification failed:",
            telegramError
          );
        }
      }
    }

    // Заказ считается принятым после сохранения в Supabase.
    return NextResponse.json({
      success: true,
      order_id: orderId,
    });
  } catch (error) {
    console.error("Order submission failed:", error);

    return NextResponse.json(
      { error: "Хатогӣ ҳангоми сабти фармоиш." },
      { status: 500 }
    );
  }
}
