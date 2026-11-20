
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  // Проверяем авторизацию
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Проверяем права администратора
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
    redirect("/admin/login");
  }

  // Загружаем все товары, включая неопубликованные
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock_quantity, is_active, image_url")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#080808] p-6 text-white md:p-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="text-sm text-gray-400 hover:text-orange-500"
        >
          ← Назад в админ-панель
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              Управление товарами
            </h1>

            <p className="mt-2 text-gray-400">
              Каталог RC.CARS_TJ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-xl bg-orange-500/10 px-5 py-3 font-semibold text-orange-500">
              Товаров: {products?.length ?? 0}
            </span>

            <Link
              href="/admin/products/new"
              className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-black transition hover:bg-orange-400"
            >
              + Добавить товар
            </Link>
          </div>
        </div>

        {productsError ? (
          <div className="mt-10 rounded-2xl border border-red-500/30 bg-[#171717] p-6">
            <p className="font-bold text-red-400">
              Не удалось загрузить товары
            </p>

            <p className="mt-2 text-sm text-gray-400">
              {productsError.message}
            </p>
          </div>
        ) : products?.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#171717] p-10 text-center">
            <div className="mb-4 text-5xl">🚗</div>

            <h2 className="text-xl font-bold">
              Пока нет товаров
            </h2>

            <p className="mt-3 text-gray-400">
              Здесь появятся RC-машинки, которые ты добавишь в магазин.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {products?.map((product) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-[#171717] p-5"
              >
                <div className="flex items-center gap-4">
                  {product.image_url ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-white/5">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/5 text-3xl">
                      🚗
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-bold">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-orange-500">
                      {product.price} сомони
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      На складе: {product.stock_quantity}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
             <span
                  className={
                  product.is_active
                  ? "rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-400"
                  : "rounded-full bg-gray-500/10 px-4 py-2 text-sm text-gray-400"
                    }
                     >
                   {product.is_active ? "Опубликован" : "Скрыт"}
               </span>

              <Link
                 href={`/admin/products/${product.id}`}
                className="rounded-xl border border-orange-500/40 px-4 py-2 font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-black"
                   >
                     Редактировать
              </Link>
                <DeleteProductButton
                  productId={product.id}
                  productName={product.name}
                /> 
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
