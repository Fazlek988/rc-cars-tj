
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type OrderSettings = {
  orders_enabled: boolean;
  minimum_order_amount: number;
  order_confirmation_required: boolean;
};

export default function OrderSettingsForm({
  initialSettings,
}: {
  initialSettings: OrderSettings;
}) {
  const router = useRouter();

  const [ordersEnabled, setOrdersEnabled] = useState(
    initialSettings.orders_enabled
  );

  const [minimumAmount, setMinimumAmount] = useState(
    String(initialSettings.minimum_order_amount)
  );

  const [confirmationRequired, setConfirmationRequired] = useState(
    initialSettings.order_confirmation_required
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const amount = Number(minimumAmount);

    if (
      minimumAmount.trim() === "" ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      Math.round(amount * 100) !== amount * 100
    ) {
      setMessage("Ошибка: укажи корректную сумму от 0 с точностью до 2 знаков.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("store_settings")
        .update({
          orders_enabled: ordersEnabled,
          minimum_order_amount: amount,
          order_confirmation_required: confirmationRequired,
        })
        .eq("id", 1)
        .select("id");

      if (error) {
        throw error;
      }

      if (!data?.length) {
        throw new Error("Нет прав на изменение настроек");
      }

      setMessage("Настройки заказов успешно сохранены");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Ошибка: ${error.message}`
          : "Не удалось сохранить настройки"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-[#171717] p-6"
    >
      <label className="flex items-center justify-between gap-4">
        <div>
          <p className="font-bold">Приём заказов</p>
          <p className="mt-1 text-sm text-gray-400">
            Разрешить покупателям оформлять новые заказы
          </p>
        </div>

        <input
          type="checkbox"
          checked={ordersEnabled}
          onChange={(e) => setOrdersEnabled(e.target.checked)}
          className="h-5 w-5 accent-orange-500"
        />
      </label>

      <div className="border-t border-white/10 pt-6">
        <label
          htmlFor="minimum-order-amount"
          className="font-bold"
        >
          Минимальная сумма заказа
        </label>

        <p className="mt-1 text-sm text-gray-400">
          Укажи минимальную сумму в сомони. 0 — без ограничений.
        </p>

        <input
          id="minimum-order-amount"
          type="number"
          min="0"
          max="9999999999.99"
          step="0.01"
          required
          value={minimumAmount}
          onChange={(e) => setMinimumAmount(e.target.value)}
          className="mt-4 w-full rounded-xl border border-white/10 bg-[#080808] p-3 text-white outline-none focus:border-orange-500"
        />
      </div>

      <label className="flex items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div>
          <p className="font-bold">
            Подтверждение администратором
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Требовать подтверждение заказа перед обработкой
          </p>
        </div>

        <input
          type="checkbox"
          checked={confirmationRequired}
          onChange={(e) => setConfirmationRequired(e.target.checked)}
          className="h-5 w-5 accent-orange-500"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-orange-500 px-6 py-3 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
      >
        {saving ? "Сохранение..." : "Сохранить настройки"}
      </button>

      {message && (
        <p role="status" className="text-center text-sm text-gray-300">
          {message}
        </p>
      )}
    </form>
  );
}
