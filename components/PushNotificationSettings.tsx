"use client";

import { Bell } from "lucide-react";
import { OPEN_PUSH_SETTINGS_EVENT } from "@/components/PushNotificationManager";

export default function PushNotificationSettings() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Bell size={19} aria-hidden="true" />Notificações no celular</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">Ative os avisos neste aparelho. Essa opção não altera o recebimento de e-mails.</p>
      <button type="button" className="btn-secondary mt-4 w-full sm:w-auto" onClick={() => window.dispatchEvent(new Event(OPEN_PUSH_SETTINGS_EVENT))}>Configurar notificações</button>
    </section>
  );
}
