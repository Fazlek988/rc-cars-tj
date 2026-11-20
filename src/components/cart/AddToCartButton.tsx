
"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  slug: string;
};

type CartItem = Product & {
  quantity: number;
};

const CART_KEY = "rc_cars_tj_cart";

export default function AddToCartButton({
  product,
}: {
  product: Product;
}) {
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  function handleAddToCart() {
    setError("");

    if (product.stock_quantity <= 0) {
      setError("Маҳсулот дар анбор нест");
      return;
    }

    try {
      const saved = localStorage.getItem(CART_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      const cart: CartItem[] = Array.isArray(parsed) ? parsed : [];

      const existing = cart.find((item) => item.id === product.id);

      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          setError("Миқдори бештар дар анбор нест");
          return;
        }

        existing.quantity += 1;
      } else {
        cart.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));

      setAdded(true);
    } catch {
      setError("Хатогӣ ҳангоми илова ба сабад");
    }
  }

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={product.stock_quantity <= 0}
        className="w-full rounded-2xl bg-orange-500 px-8 py-5 text-lg font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {product.stock_quantity <= 0
          ? "Дар анбор нест"
          : added
            ? "✓ Ба сабад илова шуд"
            : "Ба сабад +"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
