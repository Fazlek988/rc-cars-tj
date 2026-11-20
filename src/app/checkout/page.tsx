
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  quantity: number;
};

export default function CheckoutPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

const [orderSettings, setOrderSettings] = useState<{
  orders_enabled: boolean;
  minimum_order_amount: number;
} | null>(null);

const [settingsLoading, setSettingsLoading] = useState(true);
const [settingsError, setSettingsError] = useState(false);
const [cartTotal, setCartTotal] = useState(0);

useEffect(() => {
  function updateCartTotal() {
    try {
      const cart: CartItem[] = JSON.parse(
        localStorage.getItem("rc_cars_tj_cart") || "[]"
      );

      if (!Array.isArray(cart)) {
        setCartTotal(0);
        return;
      }

      const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      setCartTotal(Number.isFinite(total) ? total : 0);
    } catch {
      setCartTotal(0);
    }
  }

  updateCartTotal();

  window.addEventListener("cart-updated", updateCartTotal);

  return () => {
    window.removeEventListener("cart-updated", updateCartTotal);
  };
}, []);

useEffect(() => {
  let active = true;

  async function loadOrderSettings() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("store_settings")
      .select("orders_enabled, minimum_order_amount")
      .eq("id", 1)
      .single();

    if (!active) return;

    if (error || !data) {
      console.error("Order settings loading failed:", error);
      setSettingsError(true);
    } else {
      setOrderSettings({
        orders_enabled: data.orders_enabled,
        minimum_order_amount: Number(data.minimum_order_amount),
      });
    }

    setSettingsLoading(false);
  }

  void loadOrderSettings();

  return () => {
    active = false;
  };
}, []);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
   e.preventDefault();

if (loading || success) return;

if (settingsLoading || settingsError || !orderSettings) {
  setError(
    "Танзимоти фармоиш дастрас нестанд. Лутфан саҳифаро аз нав кушоед."
  );
  return;
}

if (!orderSettings.orders_enabled) {
  setError(
    "Қабули фармоишҳо муваққатан қатъ шудааст. Лутфан дертар кӯшиш кунед."
  );
  return;
}

if (cartTotal < orderSettings.minimum_order_amount) {
  setError(
    `Ҳадди ақали фармоиш ${orderSettings.minimum_order_amount} сомонӣ аст. Маблағи сабади шумо ${cartTotal.toFixed(2)} сомонӣ мебошад.`
  );
  return;
}

setLoading(true);
    setError("");

    try {
      // Получаем товары из корзины
      const cart: CartItem[] = JSON.parse(
        localStorage.getItem("rc_cars_tj_cart") || "[]"
      );

      if (!Array.isArray(cart) || cart.length === 0) {
        setError("Сабади шумо холӣ аст.");
        return;
      }

      // Один идентификатор для повторных попыток
      const checkoutKey =
        sessionStorage.getItem("rc_cars_tj_checkout_key") ||
        crypto.randomUUID();

      sessionStorage.setItem(
        "rc_cars_tj_checkout_key",
        checkoutKey
      );

      // Отправляем заказ на сервер
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          address: address.trim(),
          checkout_key: checkoutKey,
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "Хатогӣ ҳангоми фиристодани фармоиш."
        );
      }

      // Заказ успешно сохранён
      localStorage.removeItem("rc_cars_tj_cart");

      // Новый заказ получит новый идентификатор
      sessionStorage.removeItem(
        "rc_cars_tj_checkout_key"
      );

      // Обновляем счётчик корзины
      window.dispatchEvent(new Event("cart-updated"));

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Фармоиш фиристода нашуд. Дубора кӯшиш кунед."
      );
    } finally {
      setLoading(false);
    }
  }

  // Страница успешного оформления
  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="w-full max-w-lg text-center">
          <div className="text-6xl">✅</div>

          <h1 className="mt-6 text-3xl font-black">
            Фармоиши шумо қабул шуд!
          </h1>

          <p className="mt-4 text-gray-400">
            Ташаккур барои фармоиш! Мо ба зудӣ бо шумо
            тамос мегирем.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-orange-500 px-8 py-4 font-bold text-black transition hover:bg-orange-400"
          >
            Ба саҳифаи асосӣ →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/cart"
          className="text-gray-400 hover:text-orange-500"
        >
          ← Ба сабад
        </Link>

        <p className="mt-12 font-bold tracking-widest text-orange-500">
          RC.CARS_TJ
        </p>

        <h1 className="mt-3 text-4xl font-black">
         БА ОХИР РАСОНИДАНИ ФАРМОИШ
        </h1>

        <p className="mt-4 text-gray-400">
          Маълумоти худро ворид кунед. Мо бо шумо тамос мегирем.
        </p>

{settingsLoading && (
  <p className="mt-8 text-sm text-gray-400">
    Танзимоти фармоиш бор карда мешаванд...
  </p>
)}

{settingsError && (
  <p
    role="alert"
    className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-400"
  >
    Танзимоти фармоиш дастрас нестанд.
    Лутфан саҳифаро аз нав кушоед.
  </p>
)}

{orderSettings && !orderSettings.orders_enabled && (
  <p
    role="alert"
    className="mt-8 rounded-xl border border-orange-500/40 bg-orange-500/10 p-4 text-orange-400"
  >
    Қабули фармоишҳо муваққатан қатъ шудааст.
    Лутфан дертар кӯшиш кунед.
  </p>
)}

{orderSettings &&
  orderSettings.orders_enabled &&
  orderSettings.minimum_order_amount > 0 &&
  cartTotal < orderSettings.minimum_order_amount && (
    <div
      role="alert"
      className="mt-8 rounded-xl border border-orange-500/40 bg-orange-500/10 p-4 text-orange-400"
    >
      <p className="font-bold">
        Маблағи фармоиш аз ҳадди ақал камтар аст.
      </p>

      <p className="mt-2 text-sm">
        Ҳадди ақали фармоиш:{" "}
        {orderSettings.minimum_order_amount} сомонӣ
      </p>

      <p className="mt-1 text-sm">
        Маблағи сабади шумо: {cartTotal.toFixed(2)} сомонӣ
      </p>

      <Link
        href="/cart"
        className="mt-3 inline-block text-sm font-bold underline"
      >
        Бозгашт ба сабад
      </Link>
    </div>
  )}

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block"
            >
              Ному насаб *
            </label>

            <input
              id="name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Номи шумо"
              className="w-full rounded-xl border border-white/15 bg-[#171717] p-4 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block"
            >
              Рақами телефон *
            </label>

            <input
              id="phone"
              type="tel"
              required
              maxLength={30}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+992 ..."
              className="w-full rounded-xl border border-white/15 bg-[#171717] p-4 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="whatsapp"
              className="mb-2 block"
            >
              WhatsApp
            </label>

            <input
              id="whatsapp"
              type="tel"
              maxLength={30}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+992 ..."
              className="w-full rounded-xl border border-white/15 bg-[#171717] p-4 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-2 block"
            >
              Шаҳр ё суроға
            </label>

            <textarea
              id="address"
              maxLength={300}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Душанбе, Хуҷанд..."
              rows={3}
              className="w-full rounded-xl border border-white/15 bg-[#171717] p-4 outline-none focus:border-orange-500"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
          disabled={
               loading ||
               settingsLoading ||
               settingsError ||
               !orderSettings?.orders_enabled ||
                cartTotal < (orderSettings?.minimum_order_amount ?? 0)
               }
            className="w-full rounded-xl bg-orange-500 p-5 text-lg font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Фармоиш фиристода мешавад..."
              : "Тасдиқи фармоиш →"}
          </button>
        </form>
      </div>
    </main>
  );
}
