
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  // Проверяем пользователя через Supabase Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Проверяем роль в базе данных
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
        <header className="mb-12 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-black">
            RC<span className="text-orange-500">.CARS</span>_TJ
          </h1>
          <p className="mt-2 text-gray-400">
            Панель управления магазином
          </p>
        </header>

        <h2 className="mb-3 text-2xl font-bold">
          Добро пожаловать!
        </h2>

        <p className="mb-8 text-gray-400">
          Вы успешно вошли в систему управления магазином.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#171717] p-6">
            <div className="mb-4 text-3xl">🚗</div>
            <h3 className="text-xl font-bold">Товары</h3>
            <p className="mt-2 text-sm text-gray-400">
              Добавление, редактирование и удаление RC-машинок.
            </p>
            <p className="mt-5 text-sm text-orange-500">
              Скоро
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171717] p-6">
            <div className="mb-4 text-3xl">📦</div>
            <h3 className="text-xl font-bold">Заказы</h3>
            <p className="mt-2 text-sm text-gray-400">
              Просмотр заказов и контактов покупателей.
            </p>
            <p className="mt-5 text-sm text-orange-500">
              Скоро
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171717] p-6">
            <div className="mb-4 text-3xl">⚙️</div>
            <h3 className="text-xl font-bold">Настройки</h3>
            <p className="mt-2 text-sm text-gray-400">
              Управление магазином и администраторами.
            </p>
            <p className="mt-5 text-sm text-orange-500">
              Скоро
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-orange-500/20 bg-[#171717] p-6">
          <p className="text-sm text-gray-400">
            Авторизованный пользователь
          </p>
          <p className="mt-2 font-medium">{user.email}</p>
          <p className="mt-1 text-sm text-orange-500">
            Роль: {staff.role}
          </p>
        </div>
      </div>
    </main>
  );
}
