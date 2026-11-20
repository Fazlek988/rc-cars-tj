
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  const { data: products, error: productsError } = category
    ? await supabase
        .from("products")
        .select(
          "id, name, slug, price, old_price, image_url, stock_quantity"
        )
        .eq("category_id", category.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (productsError) {
    console.error("Ошибка загрузки товаров:", productsError.message);
  }

  return (
    <main className="min-h-screen bg-[#080808] p-6 text-white md:p-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="text-orange-500 hover:text-orange-400"
        >
          ← Ба саҳифаи асосӣ
        </Link>

        <h1 className="mt-10 text-4xl font-black">
          {category?.name ?? "Категория ёфт нашуд"}
        </h1>

        {category?.description && (
          <p className="mt-4 text-gray-400">
            {category.description}
          </p>
        )}

{category && (
  <section className="mt-12">
    {products && products.length > 0 ? (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#171717] transition hover:border-orange-500"
          >
            <div className="flex h-64 items-center justify-center bg-[#202020] p-6">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-6xl">🏎️</span>
              )}
            </div>

            <div className="p-5">
              <h2 className="text-xl font-bold">
                {product.name}
              </h2>

              <p className="mt-3 text-2xl font-black text-orange-500">
                {product.price} сомонӣ
              </p>

              {product.old_price && (
                <p className="text-sm text-gray-500 line-through">
                  {product.old_price} сомонӣ
                </p>
              )}

              <p className="mt-3 text-sm text-gray-400">
                {product.stock_quantity > 0
                  ? "Дар анбор ҳаст"
                  : "Дар анбор нест"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <p className="rounded-xl border border-white/10 bg-[#171717] p-6 text-gray-400">
        Ҳоло дар ин категория молҳои дастрас нестанд.
      </p>
    )}
  </section>
)}
      </div>
    </main>
  );
}
