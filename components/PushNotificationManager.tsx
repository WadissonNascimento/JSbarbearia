"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, X } from "lucide-react";

const DISMISSED_KEY = "js-barbearia-push-prompt-dismissed";
export const OPEN_PUSH_SETTINGS_EVENT = "js-barbearia:open-push-settings";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
}

function canUsePush() {
  return typeof window !== "undefined" && "serviceWorker" in navigator &&
    "PushManager" in window && "Notification" in window && window.isSecureContext;
}

export default function PushNotificationManager({ publicKey }: { publicKey?: string | null }) {
  const [canPrompt, setCanPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [status, setStatus] = useState<"idle" | "enabled" | "blocked" | "unsupported">("idle");
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);

  const subscribeToPush = useCallback(() => {
    if (inFlight.current) return inFlight.current;
    const task = (async () => {
      if (!publicKey || !canUsePush()) throw new Error("push_unavailable");
      await navigator.serviceWorker.register("/push-sw.js");
      // The first visit must wait for the worker to activate before subscribing.
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...subscription.toJSON(), userAgent: navigator.userAgent }),
      });
      if (!response.ok) throw new Error("push_registration_failed");
    })();
    inFlight.current = task;
    void task.finally(() => { inFlight.current = null; }).catch(() => undefined);
    return task;
  }, [publicKey]);

  useEffect(() => {
    function openSettings() {
      setCanPrompt(true);
      setError(null);
      setStatus(!canUsePush() ? "unsupported" : Notification.permission === "denied" ? "blocked" : "idle");
    }
    window.addEventListener(OPEN_PUSH_SETTINGS_EVENT, openSettings);
    if (!publicKey || !canUsePush()) return () => window.removeEventListener(OPEN_PUSH_SETTINGS_EVENT, openSettings);
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (Notification.permission === "granted") {
      void subscribeToPush().then(() => { if (!cancelled) setStatus("enabled"); }).catch(() => {
        if (!cancelled) {
          setError("Não foi possível ativar as notificações. Verifique sua conexão e tente novamente.");
          setCanPrompt(true);
        }
      });
    } else if (Notification.permission === "default") {
      let dismissed = false;
      try { dismissed = localStorage.getItem(DISMISSED_KEY) === "1"; } catch { /* Storage can be unavailable in private browsing. */ }
      if (!dismissed) timer = setTimeout(() => setCanPrompt(true), 1200);
    }
    return () => { cancelled = true; if (timer) clearTimeout(timer); window.removeEventListener(OPEN_PUSH_SETTINGS_EVENT, openSettings); };
  }, [publicKey, subscribeToPush]);

  async function handleEnable() {
    if (isSubscribing) return;
    if (!canUsePush()) { setStatus("unsupported"); return; }
    if (!publicKey) { setError("As notificações estão temporariamente indisponíveis. Tente novamente mais tarde."); return; }
    setIsSubscribing(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") { setStatus("blocked"); return; }
      if (permission !== "granted") { setError("Toque em Permitir no aviso do navegador para receber notificações."); return; }
      await subscribeToPush();
      setStatus("enabled");
    } catch {
      setError("Não foi possível ativar as notificações. Verifique sua conexão e tente novamente.");
    } finally { setIsSubscribing(false); }
  }

  function handleDismiss() {
    try { localStorage.setItem(DISMISSED_KEY, "1"); } catch { /* Closing the notice still works without storage. */ }
    setCanPrompt(false);
  }

  if (!canPrompt) return null;
  return (
    <section aria-label="Notificações no celular" className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[220] mx-auto max-w-sm rounded-3xl border border-white/15 bg-[#171717]/95 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-zinc-200">{status === "enabled" ? <Check className="h-5 w-5 text-emerald-400" /> : <Bell className="h-5 w-5" />}</div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold">{status === "enabled" ? "Notificações ativadas" : "Notificações no celular"}</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-300">
            {status === "enabled" ? "Este aparelho está pronto para receber avisos dos seus agendamentos." : status === "blocked" ? "As notificações estão bloqueadas. Abra as permissões deste site no navegador, permita as notificações e tente novamente." : status === "unsupported" ? "Este navegador não oferece notificações. Tente abrir pelo navegador do celular ou pelo aplicativo instalado." : "Receba avisos dos seus agendamentos mesmo com o site fechado. Ao continuar, toque em Permitir no aviso do navegador."}
          </p>
        </div>
        <button type="button" onClick={handleDismiss} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Fechar aviso de notificações"><X className="h-4 w-4" /></button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
      {status === "enabled" || status === "unsupported" ? <button type="button" onClick={handleDismiss} className="btn-secondary mt-4 w-full">Entendi</button> : <button type="button" onClick={handleEnable} disabled={isSubscribing} className="btn-primary mt-4 w-full">{isSubscribing ? "Ativando..." : status === "blocked" ? "Verificar permissão" : "Ativar notificações"}</button>}
    </section>
  );
}
