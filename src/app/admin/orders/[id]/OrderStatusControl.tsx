
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OrderStatus =
  | "new"
  | "processing"
  | "completed"
  | "cancelled";

type Props = {
  orderId: string;
  currentStatus: string;
};

const statusLabels: Record<OrderStatus, string> = {
  new: "Новый",
  processing: "В обработке",
  completed: "Выполнен",
  cancelled: "Отменён",
};

export default function OrderStatusControl({
  orderId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function saveStatus() {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Не удалось изменить статус");
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Ошибка сохранения. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800 p-5">
      <h2 className="mb-4 text-lg font-bold">
        Управление статусом заказа
      </h2>

      <select
        value={status}
        onChange={(event) => {
          setStatus(event.target.value);
          setSuccess(false);
        }}
        disabled={saving}
        className="w-full rounded-lg border border-gray-600 bg-gray-900 p-3 text-white"
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={saveStatus}
        disabled={saving || status === currentStatus}
        className="mt-4 rounded-lg bg-orange-500 px-5 py-3 font-bold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Сохранение..." : "Сохранить статус"}
      </button>

      {success && (
        <p className="mt-3 text-green-400">
          Статус успешно обновлён.
        </p>
      )}

      {error && (
        <p className="mt-3 text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
