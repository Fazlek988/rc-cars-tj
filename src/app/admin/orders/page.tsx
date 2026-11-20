
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  // Проверяем авторизацию пользователя
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
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, customer_name, phone, total_amount, status, created_at, telegram_sent"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (ordersError) {
    console.error(
  "Ошибка Supabase:",
  JSON.stringify(ordersError, null, 2)
);
  }
  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          📦 Заказы RC.CARS_TJ
        </h1>

        <p className="mt-3 text-gray-400">
          Управление заказами покупателей
        </p>
        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
            {ordersError ? (
  <p className="text-red-400">
    Не удалось загрузить заказы.
  </p>
) : !orders || orders.length === 0 ? (
  <p className="text-gray-400">
    Пока заказов нет.
  </p>
) : (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[750px] text-left text-sm">
      <thead className="border-b border-gray-700 text-gray-400">
        <tr>
          <th className="p-3">Дата</th>
          <th className="p-3">Покупатель</th>
          <th className="p-3">Телефон</th>
          <th className="p-3">Сумма</th>
          <th className="p-3">Статус</th>
          <th className="p-3">Telegram</th>
          <th className="p-3">Действие</th>
        </tr>
      </thead>

      <tbody>
        {orders.map((order) => (
          <tr
            key={order.id}
            className="border-b border-gray-800"
          >
            <td className="p-3 text-gray-300">
              {new Date(order.created_at).toLocaleString("ru-RU")}
            </td>

            <td className="p-3 font-medium">
              {order.customer_name}
            </td>

            <td className="p-3">{order.phone}</td>

            <td className="p-3 font-bold text-orange-400">
              {order.total_amount} сомони
            </td>

            <td className="p-3">
              {order.status === "new"
                ? "🟡 Новый"
                : order.status === "processing"
                  ? "🔵 В обработке"
                  : order.status === "completed"
                    ? "🟢 Выполнен"
                    : order.status === "cancelled"
                      ? "🔴 Отменён"
                      : order.status}
            </td>

            <td className="p-3">
              {order.telegram_sent
                ? "✅ Отправлено"
                : "⚠️ Не отправлено"}
            </td>
            <td className="p-3">
        <Link
               href={`/admin/orders/${order.id}`}
               className="inline-block rounded-lg bg-orange-500 px-4 py-2 font-semibold text-black hover:bg-orange-400"
               >
              Открыть
         </Link>
           </td>  
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
        </div>
      </div>
    </main>
  );
}
