import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderSettingsForm from "./OrderSettingsForm";

export default async function AdminOrderSettingsPage() {
  const supabase = await createClient();

  // Проверяем авторизацию
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Доступ только владельцу
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (staffError || staff?.role !== "owner") {
    redirect("/admin");
  }

  // Загружаем настройки заказов
  const { data: settings, error: settingsError } = await supabase
    .from("store_settings")
    .select(
      "orders_enabled, minimum_order_amount, order_confirmation_required"
    )
    .eq("id", 1)
    .single();

  if (settingsError) {
    console.error(
      "Ошибка загрузки настроек заказов:",
      settingsError.message
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
          Настройки заказов
        </h1>

        <p className="mt-3 text-gray-400">
          Управление оформлением заказов RC.CARS_TJ
        </p>

       <OrderSettingsForm
  initialSettings={{
    orders_enabled: settings?.orders_enabled ?? true,
    minimum_order_amount: Number(settings?.minimum_order_amount ?? 0),
    order_confirmation_required:
      settings?.order_confirmation_required ?? true,
  }}
         />
      </div>
    </main>
  );
}