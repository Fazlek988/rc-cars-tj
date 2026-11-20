import InviteAdminForm from "./InviteAdminForm";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const { data: currentStaff, error: roleError } = await supabase
    .from("staff")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleError || currentStaff?.role !== "owner") {
    redirect("/admin");
  }

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("user_id, role, created_at")
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen bg-[#080808] p-6 text-white md:p-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/settings"
          className="text-sm text-gray-400 hover:text-orange-500"
        >
          ← Назад к настройкам
        </Link>

        <h1 className="mt-8 text-3xl font-black">
          Администраторы
        </h1>

        <p className="mt-3 text-gray-400">
          RC.CARS_TJ — сотрудники и права доступа
        </p>

        <InviteAdminForm />

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#171717]">
          <div className="grid grid-cols-2 gap-4 border-b border-white/10 p-5 text-sm font-bold text-gray-400">
            <span>Сотрудник</span>
            <span>Роль</span>
          </div>

          {staffError ? (
            <p className="p-5 text-red-400">
              Не удалось загрузить сотрудников.
            </p>
          ) : !staff?.length ? (
            <p className="p-5 text-gray-400">
              Сотрудники не найдены.
            </p>
          ) : (
            staff.map((member) => (
              <div
                key={member.user_id}
                className="grid grid-cols-2 gap-4 border-b border-white/10 p-5 text-sm last:border-b-0"
              >
                <span className="break-all text-gray-300">
                  {member.user_id === user.id
                    ? "Вы (владелец)"
                    : member.user_id}
                </span>
                <span className="font-semibold text-orange-500">
                  {member.role === "owner"
                    ? "Владелец"
                    : member.role === "admin"
                      ? "Администратор"
                      : member.role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}


