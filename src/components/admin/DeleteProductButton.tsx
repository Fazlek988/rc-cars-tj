
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  productId: string;
  productName: string;
};

export default function DeleteProductButton({
  productId,
  productName,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [supabase] = useState(() => createClient());

  async function handleDelete() {
    const confirmed = window.confirm(
      `Удалить товар "${productName}"?\n\nЭто действие нельзя отменить.`
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Необходимо войти в админ-панель");
      }

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
        throw new Error("Недостаточно прав для удаления");
      }

      const { data: deleted, error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .select("id");

      if (deleteError) throw deleteError;

      if (!deleted?.length) {
        throw new Error("Товар не удалён. Проверь права доступа.");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось удалить товар"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-xl border border-red-500/40 px-4 py-2 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
      >
        {loading ? "Удаляем..." : "Удалить"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
