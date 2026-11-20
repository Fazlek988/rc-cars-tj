
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError || !data.user) {
      setError("Неверный email или пароль");
      setLoading(false);
      return;
    }

    const { data: staff, error: roleError } = await supabase
      .from("staff")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

console.log("AUTH USER ID:", data.user.id);
console.log("STAFF DATA:", staff);
console.log("STAFF ERROR:", roleError);

    if (
      roleError ||
      !staff ||
      !["owner", "admin"].includes(staff.role)
    ) {
      await supabase.auth.signOut();
      setError("У вас нет доступа к управлению магазином");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#141414] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black">
            RC<span className="text-orange-500">.CARS</span>_TJ
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            Панель управления магазином
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-gray-300"
            >
              Электронная почта
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-gray-300"
            >
              Пароль
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-white outline-none focus:border-orange-500"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-5 py-4 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? "Проверка..." : "Войти в админ-панель"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500">
          Доступ только для сотрудников RC.CARS_TJ
        </p>
      </div>
    </main>
  );
}
