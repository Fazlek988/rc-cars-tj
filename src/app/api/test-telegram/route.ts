
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available" },
      { status: 404 }
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { error: "Telegram settings are missing" },
      { status: 500 }
    );
  }

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
          text: "✅ RC.CARS_TJ\n\nТест успешен! Сайт подключён к Telegram.",
        }),
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error("Telegram test failed:", {
        status: response.status,
        errorCode: result.error_code,
        description: result.description,
      });

      return NextResponse.json(
        { error: "Telegram could not deliver the message" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test message sent",
    });
  } catch {
    return NextResponse.json(
      { error: "Telegram connection failed" },
      { status: 502 }
    );
  }
}
