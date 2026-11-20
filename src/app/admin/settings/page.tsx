
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
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

  return (
    <main className="min-h-screen bg-[#080808] p-6 text-white md:p-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="text-sm text-gray-400 hover:text-orange-500"
        >
          ← Назад в админ-панель
        </Link>

        <header className="mt-8 mb-10">
          <h1 className="text-3xl font-black">
            ⚙️ Настройки магазина
          </h1>
          <p className="mt-3 text-gray-400">
            Управление RC.CARS_TJ
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            ["🏪", "Информация о магазине", "Название и контакты"],
            ["🚚", "Доставка и оплата", "Условия покупки"],
            ["👥", "Администраторы", "Сотрудники и права доступа"],
            ["📦", "Настройки заказов", "Уведомления и обработка"],
          ].map(([icon, title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-[#171717] p-6"
            >
              <div className="mb-4 text-3xl">{icon}</div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm text-gray-400">
                {description}
              </p>
       
              {title === "Информация о магазине" ? (
                <Link
                 href="/admin/settings/store"
                className="mt-5 inline-block text-sm font-bold text-orange-500 transition hover:text-orange-400"
                >
               Редактировать информацию →
             </Link>
             ) : title === "Доставка и оплата" ? (
             <Link
             href="/admin/settings/delivery"
             className="mt-5 inline-block text-sm font-bold text-orange-500 transition hover:text-orange-400"
              >
              Настроить доставку и оплату →
              </Link>
         ) : (
            <p className="mt-5 text-sm text-orange-500">
                 В разработке
                </p>
                )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
