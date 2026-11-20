
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StoreSettingsForm from "./StoreSettingsForm";

export default async function StoreSettingsPage() {
  const supabase = await createClient();

  // Проверяем авторизацию
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Только владелец может изменять настройки
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (staffError || !staff || staff.role !== "owner") {
    redirect("/admin");
  }

  // Загружаем настройки магазина
  const { data: settings, error: settingsError } = await supabase
    .from("store_settings")
    .select(
      "store_name, phone, whatsapp, telegram, instagram, address, description"
    )
    .eq("id", 1)
    .single();

  if (settingsError || !settings) {
    return (
      <main className="min-h-screen bg-[#080808] p-8 text-white">
        Не удалось загрузить настройки магазина.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] p-6 text-white md:p-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/settings"
          className="text-sm text-gray-400 hover:text-orange-500"
        >
          ← Назад к настройкам
        </Link>

        <h1 className="mt-8 text-3xl font-black">
          🏪 Информация о магазине
        </h1>

        <p className="mt-3 text-gray-400">
          Редактирование информации RC.CARS_TJ
        </p>

        <StoreSettingsForm initialSettings={settings} />
      </div>
    </main>
  );
}
