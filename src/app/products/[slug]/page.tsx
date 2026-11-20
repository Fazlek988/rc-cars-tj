
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/components/cart/AddToCartButton";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-10 text-white md:px-16">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-gray-400 hover:text-orange-500">
          ← Ба саҳифаи асосӣ
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div className="flex min-h-80 items-center justify-center rounded-3xl bg-[#202020] p-8">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={800}
                height={800}
                unoptimized
                className="max-h-[500px] w-full object-contain"
              />
            ) : (
              <span className="text-8xl">🚗</span>
            )}
          </div>

          <div>
            <p className="mb-3 font-bold text-orange-500">
              RC.CARS_TJ
            </p>

            <h1 className="text-4xl font-black md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="text-4xl font-black text-orange-500">
                {product.price} сомонӣ
              </span>

              {product.old_price && (
                <span className="text-xl text-gray-500 line-through">
                  {product.old_price} сомонӣ
                </span>
              )}
            </div>

            <p className="mt-6 text-gray-400">
              {product.stock_quantity > 0
                ? `Дар анбор: ${product.stock_quantity} дона`
                : "Ҳоло дастрас нест"}
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#171717] p-6">
              <h2 className="mb-5 text-xl font-bold">
                Хусусиятҳо
              </h2>

              <div className="space-y-4 text-gray-300">
                {product.model && <p>Модел: {product.model}</p>}
                {product.scale && <p>Миқёс: {product.scale}</p>}
                {product.max_speed_kmh != null && (
                  <p>Суръат: {product.max_speed_kmh} км/соат</p>
                )}
                {product.battery_info && (
                  <p>Аккумулятор: {product.battery_info}</p>
                )}
              </div>
            </div>

            {product.description && (
              <div className="mt-8">
                <h2 className="mb-3 text-xl font-bold">
                  Тавсифи маҳсулот
                </h2>
                <p className="whitespace-pre-line leading-8 text-gray-400">
                  {product.description}
                </p>
              </div>
            )}

       <AddToCartButton
             product={{
             id: product.id,
             name: product.name,
             price: Number(product.price),
             image_url: product.image_url,
             stock_quantity: product.stock_quantity,
             slug: product.slug,
        }}
             />
          </div>
        </div>
      </div>
    </main>
  );
}
