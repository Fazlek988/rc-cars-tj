
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import OrderStatusControl from "./OrderStatusControl";


export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Проверка авторизации
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Проверка роли
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

  // Получаем заказ
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, created_at, customer_name, phone, whatsapp, address, total_amount, status, telegram_sent"
    )
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    console.error("Ошибка загрузки заказа:", orderError);
    throw new Error("Не удалось загрузить заказ");
  }

  if (!order) {
    notFound();
  }

  // Получаем товары этого заказа
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name, quantity, unit_price, subtotal")
    .eq("order_id", id);

  if (itemsError) {
    console.error("Ошибка загрузки товаров заказа:", itemsError);
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/orders"
          className="text-orange-400 hover:underline"
        >
          ← Назад к заказам
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          📦 Подробности заказа
        </h1>

        <div className="mt-8 space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p><strong>Номер:</strong> {order.id}</p>
          <p><strong>Покупатель:</strong> {order.customer_name}</p>
          <p><strong>Телефон:</strong> {order.phone}</p>
          <p><strong>WhatsApp:</strong> {order.whatsapp || "Не указан"}</p>
          <p><strong>Адрес:</strong> {order.address || "Не указан"}</p>
          <p>
            <strong>Дата:</strong>{" "}
            {new Date(order.created_at).toLocaleString("ru-RU")}
          </p>
        
            
          <p>
           <strong>Статус:</strong>{" "}
              {order.status === "new"
               ? "🟡 Новый"
               : order.status === "processing"
               ? "🔵 В обработке"
               : order.status === "completed"
               ? "🟢 Выполнен"
               : order.status === "cancelled"
               ? "🔴 Отменён"
               : order.status}
             </p>

           
             <OrderStatusControl
             orderId={order.id}
             currentStatus={order.status}
             />

          <p>
            <strong>Telegram:</strong>{" "}
            {order.telegram_sent ? "✅ Отправлено" : "⚠️ Не отправлено"}
          </p>
          <p className="text-xl font-bold text-orange-400">
            Итого: {order.total_amount} сомони
          </p>

<div className="mt-8 border-t border-gray-700 pt-6">
  <h2 className="mb-5 text-xl font-bold">
    🚗 Заказанные товары
  </h2>

  {itemsError ? (
    <p className="text-red-400">
      Не удалось загрузить товары заказа.
    </p>
  ) : !orderItems || orderItems.length === 0 ? (
    <p className="text-gray-400">
      Товары не найдены.
    </p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] text-left text-sm">
        <thead className="border-b border-gray-700 text-gray-400">
          <tr>
            <th className="p-3">Модель</th>
            <th className="p-3">Количество</th>
            <th className="p-3">Цена</th>
            <th className="p-3">Сумма</th>
          </tr>
        </thead>

        <tbody>
          {orderItems.map((item, index) => (
            <tr
              key={index}
              className="border-b border-gray-800"
            >
              <td className="p-3 font-medium">
                {item.product_name}
              </td>
              <td className="p-3">{item.quantity} шт.</td>
              <td className="p-3">{item.unit_price} сомони</td>
              <td className="p-3 font-bold text-orange-400">
                {item.subtotal} сомони
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

        </div>
      </div>
    </main>
  );
}
