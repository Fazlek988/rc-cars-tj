
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function NewProductPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("");
  const [scale, setScale] = useState("");
  const [speed, setSpeed] = useState("");
  const [battery, setBattery] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setError("");

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Разрешены только JPG, PNG и WebP");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Размер фотографии не должен превышать 5 MB");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    setImageFile(file);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!name.trim() || !price.trim()) {
      setError("Укажи название и цену товара");
      return;
    }

    const priceNumber = Number(price);
    const oldPriceNumber = oldPrice ? Number(oldPrice) : null;
    const stockNumber = Number(stock);
    const speedNumber = speed ? Number(speed) : null;

    if (
      !Number.isFinite(priceNumber) ||
      priceNumber <= 0 ||
      (oldPriceNumber !== null &&
        (!Number.isFinite(oldPriceNumber) || oldPriceNumber <= 0)) ||
      !Number.isInteger(stockNumber) ||
      stockNumber < 0 ||
      (speedNumber !== null &&
        (!Number.isInteger(speedNumber) || speedNumber < 0))
    ) {
      setError("Проверь цену, количество и скорость");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Войди в админ-панель заново");
        return;
      }

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
        setError("Нет прав на добавление товара");
        return;
      }

      const slug =
        name
          .trim()
          .toLowerCase()
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "rc-car";

      const uniqueSlug = `${slug}-${crypto.randomUUID().slice(0, 8)}`;

      let finalImageUrl = imageUrl.trim() || null;
      let uploadedPath: string | null = null;

      if (imageFile) {
        setStatus("Загружаем фотографию...");

        const extension =
          imageFile.type === "image/png"
            ? "png"
            : imageFile.type === "image/webp"
              ? "webp"
              : "jpg";

        const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) {
          setError(`Ошибка загрузки фотографии: ${uploadError.message}`);
          return;
        }

        uploadedPath = filePath;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      setStatus("Сохраняем товар...");

      const { error: insertError } = await supabase
        .from("products")
        .insert({
          name: name.trim(),
          slug: uniqueSlug,
          price: priceNumber,
          old_price: oldPriceNumber,
          stock_quantity: stockNumber,
          description: description.trim() || null,
          model: model.trim() || null,
          scale: scale.trim() || null,
          max_speed_kmh: speedNumber,
          battery_info: battery.trim() || null,
          image_url: finalImageUrl,
          is_active: isActive,
        });

      if (insertError) {
        if (uploadedPath) {
          await supabase.storage
            .from("product-images")
            .remove([uploadedPath]);
        }

        setError(`Ошибка сохранения товара: ${insertError.message}`);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Не удалось сохранить товар. Попробуй ещё раз.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-white outline-none focus:border-orange-500";

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
          Добавить товар
        </h1>

        <p className="mt-2 text-gray-400">
          Новая RC-машинка для RC.CARS_TJ
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
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MJX 12212"
              required
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
                className={inputClass}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
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
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
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
              className={inputClass}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание машинки на таджикском языке"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="model" className="mb-2 block">
                Модель
              </label>
              <input
                id="model"
                className={inputClass}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="MJX 12212"
              />
            </div>

            <div>
              <label htmlFor="scale" className="mb-2 block">
                Масштаб
              </label>
              <input
                id="scale"
                className={inputClass}
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                placeholder="1/12"
              />
            </div>

            <div>
              <label htmlFor="speed" className="mb-2 block">
                Максимальная скорость (км/ч)
              </label>
              <input
                id="speed"
                type="number"
                min="0"
                step="1"
                className={inputClass}
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="battery" className="mb-2 block">
                Аккумулятор
              </label>
              <input
                id="battery"
                className={inputClass}
                value={battery}
                onChange={(e) => setBattery(e.target.value)}
                placeholder="2S LiPo"
              />
            </div>
          </div>

          <div>
            <label htmlFor="imageFile" className="mb-2 block">
              Фотография товара
            </label>
            <input
              id="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="block w-full cursor-pointer rounded-xl border border-white/10 bg-[#202020] p-3 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:font-semibold file:text-black"
            />
            <p className="mt-2 text-xs text-gray-400">
              JPG, PNG или WebP. Максимальный размер — 5 MB.
            </p>
            {imageFile && (
              <p className="mt-2 text-sm text-orange-400">
                Выбрано: {imageFile.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="imageUrl" className="mb-2 block">
              Или ссылка на фотографию
            </label>
            <input
              id="imageUrl"
              type="url"
              className={inputClass}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/car.jpg"
              disabled={Boolean(imageFile)}
            />
            <p className="mt-2 text-xs text-gray-400">
              Если выбрана фотография с компьютера, используется она.
            </p>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
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

          {status && (
            <p className="text-center text-sm text-orange-400">
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-6 py-4 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? "Сохраняем..." : "Сохранить товар"}
          </button>
        </form>
      </div>
    </main>
  );
}
