
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  quantity: number;
};

const CART_KEY = "rc_cars_tj_cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];

      setCart(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCart([]);
    }

    setLoaded(true);
  }, []);

  function saveCart(updated: CartItem[]) {
    setCart(updated);
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));
  }

  function changeQuantity(id: string, change: number) {
    const updated = cart.map((item) => {
      if (item.id !== id) return item;

      return {
        ...item,
        quantity: Math.max(
          1,
          Math.min(item.stock_quantity, item.quantity + change)
        ),
      };
    });

    saveCart(updated);
  }

  function removeItem(id: string) {
    saveCart(cart.filter((item) => item.id !== id));
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const count = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-10 text-white md:px-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-gray-400 transition hover:text-orange-500"
        >
          ← Ба мағоза
        </Link>

        <div className="mt-10 mb-10">
          <p className="mb-3 text-sm font-bold tracking-widest text-orange-500">
            RC.CARS_TJ
          </p>
          <h1 className="text-4xl font-black md:text-5xl">
            САБАДИ ХАРИД
          </h1>
          <p className="mt-3 text-gray-400">
            Маҳсулот дар сабад: {count}
          </p>
        </div>

        {!loaded ? (
          <p className="text-gray-400">Бор шуда истодааст...</p>
        ) : cart.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#171717] p-12 text-center">
            <div className="mb-5 text-6xl">🛒</div>
            <h2 className="text-2xl font-bold">
              Сабади шумо холӣ аст
            </h2>
            <p className="mt-3 text-gray-400">
              Барои харид аввал маҳсулот интихоб кунед.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-xl bg-orange-500 px-8 py-4 font-bold text-black hover:bg-orange-400"
            >
              Дидани маҳсулот
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-[#171717] p-5"
                >
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#252525]">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-5xl">🚗</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-xl font-bold hover:text-orange-500"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-2 font-bold text-orange-500">
                        {item.price} сомонӣ
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="mt-3 text-sm text-red-400 hover:text-red-300"
                      >
                        Нест кардан
                      </button>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-white/10 p-2">
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1 text-xl disabled:opacity-30"
                      >
                        −
                      </button>

                      <span className="min-w-6 text-center font-bold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => changeQuantity(item.id, 1)}
                        disabled={item.quantity >= item.stock_quantity}
                        className="px-3 py-1 text-xl disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-right text-sm text-gray-400">
                    Ҷамъ:{" "}
                    <span className="font-bold text-white">
                      {item.price * item.quantity} сомонӣ
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-white/10 bg-[#171717] p-6">
              <h2 className="text-xl font-bold">
                Ҷамъбасти фармоиш
              </h2>

              <div className="mt-6 flex justify-between text-gray-400">
                <span>Маҳсулот</span>
                <span>{count} дона</span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                <span className="font-bold">Ҳамагӣ</span>
                <span className="text-2xl font-black text-orange-500">
                  {total} сомонӣ
                </span>
              </div>

            
            <Link
                  href="/checkout"
                  className="mt-8 block w-full rounded-xl bg-orange-500 px-5 py-4 text-center font-black text-black transition hover:bg-orange-400"
                >
                 Ба охир расонидани фармоиш →
            </Link>


              <p className="mt-4 text-center text-xs text-gray-500">
                Нарх ва мавҷудият ҳангоми фармоиш тасдиқ мешаванд.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
