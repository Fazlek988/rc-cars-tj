"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function InviteAdminForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Не удалось отправить приглашение");
        return;
      }

      setMessage("Приглашение отправлено на email.");
      setEmail("");
      router.refresh();
    } catch {
      setError("Ошибка соединения. Попробуй ещё раз.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-2xl border border-white/10 bg-[#171717] p-6"
    >
      <h2 className="text-xl font-bold">
        Пригласить администратора
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        Сотрудник получит письмо для создания пароля.
        Приглашение действительно 48 часов.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email сотрудника"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-white outline-none focus:border-orange-500"
        />

        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-black disabled:opacity-50"
        >
          {sending ? "Отправляем..." : "Пригласить"}
        </button>
      </div>

      {message && (
        <p role="status" className="mt-4 text-sm text-green-400">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
