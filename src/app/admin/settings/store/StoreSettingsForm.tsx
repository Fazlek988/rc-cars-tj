
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type StoreSettings = {
  store_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  instagram: string | null;
  address: string | null;
  description: string | null;
};

type FieldName = keyof StoreSettings;

const fields: { name: FieldName; label: string }[] = [
  { name: "store_name", label: "Название магазина" },
  { name: "phone", label: "Телефон" },
  { name: "whatsapp", label: "WhatsApp" },
  { name: "telegram", label: "Telegram" },
  { name: "instagram", label: "Instagram" },
  { name: "address", label: "Адрес" },
  { name: "description", label: "Описание магазина" },
];

export default function StoreSettingsForm({
  initialSettings,
}: {
  initialSettings: StoreSettings;
}) {
  const router = useRouter();
  const [form, setForm] = useState<StoreSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(name: FieldName, value: string) {
    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("store_settings")
        .update(form)
        .eq("id", 1);

      if (error) {
        throw error;
      }

      setMessage("Настройки успешно сохранены.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Ошибка сохранения: ${error.message}`
          : "Не удалось сохранить настройки."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-[#171717] p-6"
    >
      {fields.map(({ name, label }) => (
        <label key={name} className="block">
          <span className="mb-2 block text-sm text-gray-400">
            {label}
          </span>

          {name === "description" ? (
            <textarea
              value={form[name] ?? ""}
              onChange={(event) =>
                updateField(name, event.target.value)
              }
              rows={4}
              className="w-full rounded-xl border border-white/15 bg-[#080808] p-3 text-white outline-none focus:border-orange-500"
            />
          ) : (
            <input
              type="text"
              value={form[name] ?? ""}
              onChange={(event) =>
                updateField(name, event.target.value)
              }
              required={name === "store_name"}
              className="w-full rounded-xl border border-white/15 bg-[#080808] p-3 text-white outline-none focus:border-orange-500"
            />
          )}
        </label>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black disabled:opacity-50"
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
