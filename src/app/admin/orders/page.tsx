
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


export default async function AdminOrdersPage({
  searchParams,
}: {
searchParams: Promise<{ q?: string; status?: string }>;
}) {
const { q, status } = await searchParams;
  const searchQuery = q?.trim() ?? "";
const allowedStatuses = [
  "new",
  "processing",
  "completed",
  "cancelled",
];
const selectedStatus =
  status && allowedStatuses.includes(status) ? status : "";

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
 
let ordersQuery = supabase
  .from("orders")
  .select(
    "id, customer_name, phone, total_amount, status, created_at, telegram_sent"
  );


if (searchQuery) {
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      searchQuery
    );

  if (isUUID) {
    ordersQuery = ordersQuery.eq("id", searchQuery);
  } else {
    const safeQuery = searchQuery.replace(/[%,()."\\]/g, " ");

    ordersQuery = ordersQuery.or(
      `customer_name.ilike.%${safeQuery}%,phone.ilike.%${safeQuery}%`
    );
  }
}


if (selectedStatus) {
  ordersQuery = ordersQuery.eq("status", selectedStatus);
}
const { data: orders, error: ordersError } = await ordersQuery
  .order("created_at", { ascending: false })
  .limit(50);


  if (ordersError) {
    console.error(
  "Ошибка Supabase:",
  JSON.stringify(ordersError, null, 2)
);
  }

const { data: orderStats, error: statsError } = await supabase
  .from("orders")
  .select("status");

if (statsError) {
  console.error("Ошибка загрузки статистики заказов:", statsError);
}

const statusCounts = {
  new: 0,
  processing: 0,
  completed: 0,
  cancelled: 0,
};

if (orderStats) {
  for (const order of orderStats) {
    const status = order.status as keyof typeof statusCounts;

    if (status in statusCounts) {
      statusCounts[status]++;
    }
  }
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


<div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
  {[

   
  
{
  label: "📦 Все заказы",
  count: orderStats?.length ?? 0,
  href: "/admin/orders",
},
{
  label: "🟡 Новые",
  count: statusCounts.new,
  href: "/admin/orders?status=new",
},
{
  label: "🔵 В обработке",
  count: statusCounts.processing,
  href: "/admin/orders?status=processing",
},
{
  label: "🟢 Выполненные",
  count: statusCounts.completed,
  href: "/admin/orders?status=completed",
},
{
  label: "🔴 Отменённые",
  count: statusCounts.cancelled,
  href: "/admin/orders?status=cancelled",
},
].map((item) => (

<Link
  key={item.label}
  href={item.href ?? "/admin/orders"}
  className="block rounded-xl border border-gray-800 bg-gray-900 p-5 transition hover:border-orange-500 hover:bg-gray-800"
>
      <p className="text-sm text-gray-400">{item.label}</p>
      <p className="mt-2 text-3xl font-bold text-white">
        {item.count}
      </p>
    </Link>
  ))}
</div>

          <form action="/admin/orders" className="mt-6">
<select
  name="status"
  defaultValue={selectedStatus}
  className="mb-3 w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-orange-500"
>
  <option value="">Все статусы</option>
  <option value="new">🟡 Новые</option>
  <option value="processing">🔵 В обработке</option>
  <option value="completed">🟢 Выполненные</option>
  <option value="cancelled">🔴 Отменённые</option>
</select>
           <input
             type="search"
             name="q"
             defaultValue={searchQuery}
             placeholder="Поиск по имени, телефону или ID заказа"
             className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-orange-500"
             />
<button
  type="submit"
  className="mt-3 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400"
>
  🔍 Найти заказы
</button>
            </form>

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
