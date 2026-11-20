
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeliverySettingsForm from "./DeliverySettingsForm";

export default async function AdminDeliveryPage() {
  const supabase = await createClient();

  // Проверяем авторизацию
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Только владелец может менять настройки
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (staffError || staff?.role !== "owner") {
    redirect("/admin");
  }

  // Получаем условия доставки и оплаты
  const { data: settings, error: settingsError } = await supabase
    .from("store_settings")
    .select(
      "delivery_dushanbe_free, delivery_other_cities, payment_info"
    )
    .eq("id", 1)
    .single();

  if (settingsError) {
    console.error(
      "Ошибка загрузки доставки:",
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
          🚚 Доставка и оплата
        </h1>

        <p className="mt-3 text-gray-400">
          Условия доставки и оплаты RC.CARS_TJ
        </p>

        <DeliverySettingsForm
          initialSettings={{
            delivery_dushanbe_free:
              settings?.delivery_dushanbe_free ?? true,
            delivery_other_cities:
              settings?.delivery_other_cities ?? "",
            payment_info:
              settings?.payment_info ?? "",
          }}
        />
      </div>
    </main>
  );
}
