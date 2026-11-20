
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  stock_quantity: number;
  description: string | null;
  brand: string | null;
  model: string | null;
  scale: string | null;
  max_speed_kmh: number | null;
  battery_info: string | null;
  image_url: string | null;
  is_active: boolean;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-white outline-none focus:border-orange-500";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [supabase] = useState(() => createClient());

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !user) {
        router.replace("/admin/login");
        return;
      }

      const { data: staff, error: staffError } = await supabase
        .from("staff")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (cancelled) return;

      if (
        staffError ||
        !staff ||
        !["owner", "admin"].includes(staff.role)
      ) {
        router.replace("/admin/login");
        return;
      }

      const { data, error: loadError } = await supabase
        .from("products")
        .select(
          "id, name, price, old_price, stock_quantity, description, brand, model, scale, max_speed_kmh, battery_info, image_url, is_active"
        )
        .eq("id", id)
        .single();

      if (cancelled) return;

      if (loadError || !data) {
        setError(loadError?.message || "Товар не найден");
      } else {
        setProduct(data as Product);
      }

      setLoading(false);
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id, router, supabase]);

  function updateField<K extends keyof Product>(
    field: K,
    value: Product[K]
  ) {
    setProduct((current) =>
      current ? { ...current, [field]: value } : current
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;

    setError("");

    if (
      !product.name.trim() ||
      !Number.isFinite(product.price) ||
      product.price <= 0 ||
      !Number.isInteger(product.stock_quantity) ||
      product.stock_quantity < 0 ||
      (product.old_price !== null &&
        (!Number.isFinite(product.old_price) ||
          product.old_price <= 0)) ||
      (product.max_speed_kmh !== null &&
        (!Number.isInteger(product.max_speed_kmh) ||
          product.max_speed_kmh < 0))
    ) {
      setError("Проверь название, цену, остаток и скорость");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: product.name.trim(),
          price: product.price,
          old_price: product.old_price,
          stock_quantity: product.stock_quantity,
          description: product.description?.trim() || null,
          brand: product.brand?.trim() || null,
          model: product.model?.trim() || null,
          scale: product.scale?.trim() || null,
          max_speed_kmh: product.max_speed_kmh,
          battery_info: product.battery_info?.trim() || null,
          image_url: product.image_url?.trim() || null,
          is_active: product.is_active,
        })
        .eq("id", product.id)
        .select("id")
        .single();

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] p-12 text-white">
        Загружаем товар...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#080808] p-12 text-white">
        <p className="text-red-400">{error || "Товар не найден"}</p>
        <Link href="/admin/products" className="mt-6 block text-orange-500">
          ← Назад к товарам
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] p-6 text-white md:p-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/products"
          className="text-sm text-gray-400 hover:text-orange-500"
        >
          ← Назад к товарам
        </Link>

        <h1 className="mt-8 text-3xl font-black">
          Редактировать товар
        </h1>
        <p className="mt-2 text-gray-400">
          RC.CARS_TJ — управление каталогом
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-[#171717] p-6"
        >
          <div>
            <label htmlFor="name" className="mb-2 block">
              Название товара *
            </label>
            <input
              id="name"
              required
              className={inputClass}
              value={product.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="price" className="mb-2 block">
                Цена (сомони) *
              </label>
              <input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                required
                className={inputClass}
                value={product.price}
                onChange={(e) =>
                  updateField("price", Number(e.target.value))
                }
              />
            </div>

            <div>
              <label htmlFor="oldPrice" className="mb-2 block">
                Старая цена
              </label>
              <input
                id="oldPrice"
                type="number"
                min="0.01"
                step="0.01"
                className={inputClass}
                value={product.old_price ?? ""}
                onChange={(e) =>
                  updateField(
                    "old_price",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div>
            <label htmlFor="stock" className="mb-2 block">
              Количество на складе
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              required
              className={inputClass}
              value={product.stock_quantity}
              onChange={(e) =>
                updateField("stock_quantity", Number(e.target.value))
              }
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block">
              Описание товара
            </label>
            <textarea
              id="description"
              rows={4}
              className={inputClass}
              value={product.description ?? ""}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="brand" className="mb-2 block">
                Бренд
              </label>
              <input
                id="brand"
                className={inputClass}
                value={product.brand ?? ""}
                onChange={(e) => updateField("brand", e.target.value)}
                placeholder="MJX"
              />
            </div>

            <div>
              <label htmlFor="model" className="mb-2 block">
                Модель
              </label>
              <input
                id="model"
                className={inputClass}
                value={product.model ?? ""}
                onChange={(e) => updateField("model", e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="scale" className="mb-2 block">
                Масштаб
              </label>
              <input
                id="scale"
                className={inputClass}
                value={product.scale ?? ""}
                onChange={(e) => updateField("scale", e.target.value)}
                placeholder="1/12"
              />
            </div>

            <div>
              <label htmlFor="speed" className="mb-2 block">
                Скорость (км/ч)
              </label>
              <input
                id="speed"
                type="number"
                min="0"
                step="1"
                className={inputClass}
                value={product.max_speed_kmh ?? ""}
                onChange={(e) =>
                  updateField(
                    "max_speed_kmh",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div>
            <label htmlFor="battery" className="mb-2 block">
              Аккумулятор
            </label>
            <input
              id="battery"
              className={inputClass}
              value={product.battery_info ?? ""}
              onChange={(e) =>
                updateField("battery_info", e.target.value)
              }
              placeholder="2S LiPo"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="mb-2 block">
              Ссылка на фотографию
            </label>
            <input
              id="imageUrl"
              type="url"
              className={inputClass}
              value={product.image_url ?? ""}
              onChange={(e) =>
                updateField("image_url", e.target.value)
              }
              placeholder="https://..."
            />

            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="mt-4 h-40 w-40 rounded-xl bg-white/5 object-contain"
              />
            )}
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={product.is_active}
              onChange={(e) =>
                updateField("is_active", e.target.checked)
              }
              className="h-5 w-5 accent-orange-500"
            />
            Опубликовать товар в магазине
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-orange-500 px-6 py-4 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {saving ? "Сохраняем..." : "Сохранить изменения"}
          </button>
        </form>
      </div>
    </main>
  );
}
