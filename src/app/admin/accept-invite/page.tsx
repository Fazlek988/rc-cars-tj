
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AcceptInvitePage() {
  const [supabase] = useState(() => createClient());
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const hash = new URLSearchParams(
  window.location.hash.substring(1)
);

const accessToken = hash.get("access_token");
const refreshToken = hash.get("refresh_token");

if (accessToken && refreshToken) {
  const { error: sessionError } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

  if (sessionError) {
    console.error(
      "Invitation session error:",
      sessionError.message
    );
  } else {
    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  }
}
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        setAuthorized(false);
      } else {
        const { data: staff, error: staffError } = await supabase
          .from("staff")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (!active) return;

        setAuthorized(
          !staffError && staff?.role === "admin"
        );
      }
      setChecking(false);
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError("Не удалось установить пароль");
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Произошла ошибка. Попробуй ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171717] p-8">
        <h1 className="text-2xl font-black">
          RC.CARS_TJ
        </h1>

        <p className="mt-2 text-gray-400">
          Приглашение администратора
        </p>

        {checking ? (
          <p className="mt-8 text-gray-400">
            Проверяем приглашение...
          </p>
        ) : !authorized ? (
          <div className="mt-8">
            <p className="text-red-400">
              Сессия приглашения не найдена. Открой ссылку
              из письма или запроси новое приглашение.
            </p>
          </div>
        ) : success ? (
          <div className="mt-8">
            <p className="text-green-400">
              Пароль успешно установлен.
            </p>

            <Link
              href="/admin"
              className="mt-6 inline-block font-bold text-orange-500"
            >
              Перейти в админ-панель →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm">
                Новый пароль
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm">
                Повтори пароль
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-black disabled:opacity-50"
            >
              {saving ? "Сохраняем..." : "Установить пароль"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}


