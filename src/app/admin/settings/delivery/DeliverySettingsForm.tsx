
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DeliverySettings = {
  delivery_dushanbe_free: boolean | null;
  delivery_other_cities: string | null;
  payment_info: string | null;
};

export default function DeliverySettingsForm({
  initialSettings,
}: {
  initialSettings: DeliverySettings;
}) {
  const router = useRouter();

  const [freeDelivery, setFreeDelivery] = useState(
    initialSettings.delivery_dushanbe_free ?? true
  );

  const [otherCities, setOtherCities] = useState(
    initialSettings.delivery_other_cities ?? ""
  );

  const [paymentInfo, setPaymentInfo] = useState(
    initialSettings.payment_info ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("store_settings")
        .update({
          delivery_dushanbe_free: freeDelivery,
          delivery_other_cities: otherCities,
          payment_info: paymentInfo,
        })
        .eq("id", 1)
        .select("id");

      if (error) {
        throw error;
      }

      if (!data?.length) {
        throw new Error("Нет прав на изменение настроек");
      }

      setMessage("✅ Изменения успешно сохранены");
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
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={freeDelivery}
          onChange={(e) => setFreeDelivery(e.target.checked)}
          className="h-5 w-5 accent-orange-500"
        />
        <span>Бесплатная доставка по Душанбе</span>
      </label>

      <div>
        <label className="mb-2 block font-bold">
          Доставка в другие города
        </label>
        <textarea
          value={otherCities}
          onChange={(e) => setOtherCities(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/20 bg-[#080808] p-4 text-white outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label className="mb-2 block font-bold">
          Условия оплаты
        </label>
        <textarea
          value={paymentInfo}
          onChange={(e) => setPaymentInfo(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/20 bg-[#080808] p-4 text-white outline-none focus:border-orange-500"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
      >
        {saving ? "Сохранение..." : "Сохранить изменения"}
      </button>

      {message && (
        <p role="status" className="text-sm text-gray-300">
          {message}
        </p>
      )}
    </form>
  );
}
