
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";


const categories = [
  {
    name: "Дрифт",
    icon: "🏎️",
    description: "Мошинҳои дрифт",
    slug: "drift",
  },
  {
    name: "Оффроуд",
    icon: "⛰️",
    description: "Барои роҳҳои душвор",
    slug: "offroad",
  },
  {
    name: "Монстр-трак",
    icon: "🚙",
    description: "Қудрат ва суръат",
    slug: "monster-truck",
  },
  {
    name: "Шорт-корс",
    icon: "🏁",
    description: "Мошинҳои пойга",
    slug: "short-course",
  },
  {
    name: "Вертолётҳо",
    icon: "🚁",
    description: "Парвоз ва адреналин",
    slug: "helicopters",
  },
];

export default async function Home() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, price, old_price, image_url, stock_quantity")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Ошибка загрузки каталога:", error.message);
  }
  const { data: storeSettings, error: storeSettingsError } = await supabase
    .from("store_settings")
    .select("store_name, phone, whatsapp, telegram, instagram, address, description, delivery_dushanbe_free, delivery_other_cities, payment_info")
    .eq("id", 1)
    .maybeSingle();

  if (storeSettingsError) {
    console.error(
      "Ошибка загрузки настроек магазина:",
      storeSettingsError.message
    );
  }
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080808] text-white">
      {/* Навигация */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/10 px-6 py-6 md:px-16">
        <div className="text-2xl font-black tracking-tight">
          RC<span className="text-orange-500">.CARS</span>_TJ
        </div>

        <nav className="hidden gap-8 text-sm text-gray-300 md:flex">
          <a href="#home" className="hover:text-orange-500">
            Асосӣ
          </a>
          <a href="#categories" className="hover:text-orange-500">
            Категорияҳо
          </a>
          <a href="#about" className="hover:text-orange-500">
            Дар бораи мо
          </a>
        </nav>

       <div className="flex items-center gap-3">
  <Link
    href="/cart"
    className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-orange-500 hover:text-orange-500"
  >
    🛒 Сабад
  </Link>

           <a
              href="#catalog"
              className="rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-orange-400"
             >
            Каталог
           </a>
         </div>
      </header>

      {/* Главный экран */}
      <section
        id="home"
        className="relative isolate overflow-hidden px-6 py-20 md:px-16 md:py-28"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(249,115,22,0.20),transparent_55%)]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* Текст */}
          <div>
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-2 text-xs font-bold tracking-widest text-orange-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              RC.CARS_TJ / MJX HYPER GO
            </div>

            <h1 className="text-5xl font-black uppercase leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
              ҚУДРАТРО
              <span className="block text-orange-500">
                ЭҲСОС КУН!
              </span>
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-relaxed text-gray-400">
              Мошинҳои радиои идорашавандаи MJX барои
              дӯстдорони суръат, адреналин ва саёҳатҳои воқеӣ.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#categories"
                className="rounded-full bg-orange-500 px-8 py-4 font-bold text-black transition hover:scale-105 hover:bg-orange-400"
              >
                Тамошои моделҳо →
              </a>

              <a
                href="#about"
                className="rounded-full border border-white/20 px-8 py-4 font-bold transition hover:border-orange-500 hover:text-orange-400"
              >
                Дар бораи мо
              </a>
            </div>

            <div className="mt-14 flex flex-wrap gap-8 border-t border-white/10 pt-7">
              {[
                ["MJX", "HYPER GO"],
                ["4WD", "OFF-ROAD"],
                ["RC", "TAJIKISTAN"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Машина */}
          <div className="relative flex min-h-[350px] items-center justify-center sm:min-h-[450px]">
            <div className="pointer-events-none absolute h-[70%] w-[80%] rounded-full bg-orange-600/25 blur-[90px]" />

            <div className="absolute right-0 top-0 text-right">
              <p className="text-xs font-bold tracking-widest text-orange-500">
                FEATURED MODEL
              </p>
              <p className="mt-2 text-3xl font-black">
                MJX 12212
              </p>
            </div>

            <div className="relative w-full transition-transform duration-700 hover:scale-105">
              <Image
               src="/mjx-12212-transparent.png"
                alt="MJX 12212 RC Monster Truck"
                width={1000}
                height={750}
                priority
                className="h-auto w-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.75)]"
              />
            </div>

            <div className="absolute bottom-0 right-0 rounded-2xl border border-white/10 bg-[#151515]/90 px-6 py-4 backdrop-blur-md">
              <p className="text-xs font-bold tracking-widest text-orange-500">
                RC EXPERIENCE
              </p>
              <p className="mt-1 text-sm text-gray-300">
                Built for adventure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Категории */}
      <section id="categories" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-bold tracking-widest text-orange-500">
            COLLECTION
          </p>

          <h2 className="mb-10 text-3xl font-black md:text-5xl">
            КАТЕГОРИЯҲО
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
         
            {categories.map((category) => (
                  <Link
                  key={category.name}
                  href={`/categories/${category.slug}`}
                  className="group block rounded-2xl border border-white/10 bg-[#141414] p-8 transition duration-300 hover:-translate-y-2 hover:border-orange-500"
                >
       <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl bg-[#0a0a0a]">
  <Image
    src={
      category.slug === "drift"
        ? "/мустанг.png"
        : category.slug === "offroad"
        ? "/бронко.png"
        : category.slug === "monster-truck"
        ? "/монстртрак.png"
        : category.slug === "short-course"
        ? "/шоурткоурс.png"
        : category.slug === "helicopters"
        ? "/вертолет.png"
        : "/монстртрак.png"
    }
    alt={category.name}
    fill
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    className="object-cover transition-transform duration-500 group-hover:scale-105"
  />
</div>
                <h3 className="mb-2 text-2xl font-bold">
                  {category.name}
                </h3>

                <p className="text-gray-400">
                  {category.description}
                </p>

           <div className="mt-8 font-bold text-orange-500">
                  Дидани моделҳо →
              </div>
            </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Каталог товаров */}
      <section id="catalog" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-bold tracking-widest text-orange-500">
            RC.CARS_TJ COLLECTION
          </p>

          <h2 className="mb-10 text-3xl font-black md:text-5xl">
            МОШИНҲОИ МО
          </h2>

          {!products || products.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#141414] p-10 text-center">
              <p className="text-gray-400">
                Ҳоло молҳо барои фурӯш дастрас нестанд.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#171717] transition duration-300 hover:-translate-y-2 hover:border-orange-500"
                >
                  <div className="flex h-64 items-center justify-center bg-[#222222] p-6">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-6xl">🚙</span>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold">
                      {product.name}
                    </h3>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="text-2xl font-black text-orange-500">
                        {product.price} сомонӣ
                      </span>

                      {product.old_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.old_price} сомонӣ
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm text-gray-400">
                      {product.stock_quantity > 0
                        ? "Дар анбор ҳаст"
                        : "Тамом шудааст"}
                    </p>

                    <a
                      href={`/products/${product.slug}`}
                      className="mt-6 block rounded-xl bg-orange-500 px-5 py-3 text-center font-bold text-black transition hover:bg-orange-400"
                    >
                      Муфассал →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
       
{/* Доставка и оплата */}
<section className="border-t border-white/10 px-6 py-16 md:px-16">
  <div className="mx-auto max-w-7xl">
   <h2 className="mb-10 text-center text-3xl font-black md:text-4xl">
  <span className="text-orange-500">Расонидан</span>
  {" ва "}
  <span className="text-white">пардохт</span>
</h2>

    <div className="grid gap-5 md:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-[#171717] p-6">
   <div className="relative mb-5 h-44 overflow-hidden rounded-xl">
  <Image
    src="/delivery-dushanbe.png"
    alt="Расонидан дар Душанбе"
    fill
    sizes="(max-width: 768px) 100vw, 33vw"
    className="object-cover"
  />
</div>
        <h3 className="text-xl font-bold">
          Расонидан дар Душанбе
        </h3>
        <p className="mt-3 text-gray-400">
          {storeSettings?.delivery_dushanbe_free
            ? "Расонидан дар шаҳри Душанбе ройгон аст."
            : "Нархи расонидан дар Душанбе мувофиқа карда мешавад."}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#171717] p-6">
        <div className="relative mb-5 h-44 overflow-hidden rounded-xl">
  <Image
    src="/delivery-tajikistan.png"
    alt="Расонидан ба шаҳрҳои Тоҷикистон"
    fill
    sizes="(max-width: 768px) 100vw, 33vw"
    className="object-cover"
  />
</div>
        <h3 className="text-xl font-bold">
          Дигар шаҳрҳои Тоҷикистон
        </h3>
        <p className="mt-3 text-gray-400">
          {storeSettings?.delivery_other_cities ||
            "Шартҳои расонидан бо муштарӣ мувофиқа карда мешаванд."}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#171717] p-6">
     <div className="relative mb-5 h-44 overflow-hidden rounded-xl">
  <Image
    src="/payment.png"
    alt="Тарзи пардохт"
    fill
    sizes="(max-width: 768px) 100vw, 33vw"
    className="object-cover"
  />
</div>
        <h3 className="text-xl font-bold">
          Тарзи пардохт
        </h3>
        <p className="mt-3 text-gray-400">
          {storeSettings?.payment_info ||
            "Тарзи пардохт тавассути WhatsApp мувофиқа карда мешавад."}
        </p>
      </div>
    </div>
  </div>
</section>

      
{/* Подвал */}
<footer
  id="about"
  className="border-t border-white/10 px-6 py-10 text-center text-sm text-gray-500"
>
  <p>© 2026 RC.CARS_TJ — Тоҷикистон</p>

<div className="mt-6 flex flex-wrap items-center justify-center gap-5">
  {storeSettings?.phone && (
    <a
      href={`tel:${storeSettings.phone.replace(/[^\d+]/g, "")}`}
      className="transition hover:text-orange-500"
    >
      📞 {storeSettings.phone}
    </a>
  )}

  {storeSettings?.whatsapp && (
    <a
      href={`https://wa.me/${storeSettings.whatsapp.replace(/\D/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="transition hover:text-orange-500"
    >
      WhatsApp
    </a>
  )}

  {storeSettings?.telegram && (
    <a
      href={`https://t.me/${storeSettings.telegram.replace(/^@/, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="transition hover:text-orange-500"
    >
      Telegram
    </a>
  )}

  {storeSettings?.instagram && (
    <a
      href={`https://www.instagram.com/${storeSettings.instagram.replace(/^@/, "")}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="transition hover:text-orange-500"
    >
      Instagram
    </a>
  )}
</div>

{storeSettings?.address && (
  <p className="mt-5 text-gray-400">
    📍 {storeSettings.address}
  </p>
)}

  <Link
    href="/admin"
    className="mt-4 inline-block text-gray-600 transition hover:text-orange-500"
  >
    Админ-панель
  </Link>
</footer>
    </main>
  );
}
