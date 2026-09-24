import { config } from "dotenv";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import * as customer from "../lib/email/customerTemplates";
import * as barber from "../lib/email/barberTemplates";
import { renderVipPaymentEmail } from "../lib/email/vipTemplates";

type Sample = { slug: string; subject: string; html: string; text: string };

const theme = {
  nomeBarbearia: "JS Barbearia",
  logoBarbearia: "https://jsbarbearia.com/brands/js-barbearia/app-icon-512.png?v=20260924-full-logo",
  corPrimaria: "#c8c8c8",
  enderecoBarbearia: "Rua Gomes Cardim, 271 - Brás",
  telefoneBarbearia: "(11) 97071-8000",
};
const appointment = {
  ...theme,
  nomeCliente: "Wadisson (exemplo)", nomeBarbeiro: "Jean Santana",
  servico: "Cabelo + Sobrancelha", detalhesServico: "50 minutos de atendimento",
  dataAgendamento: "sexta-feira, 25/09/2026", horarioAgendamento: "14:00",
  codigoAgendamento: "DEMONSTRAÇÃO", valorTotal: "R$ 62,00",
  extras: "1 × Gel Cera Hidratante Pierry Lohan 250g — R$ 12,00",
  linkPainelCliente: "https://jsbarbearia.com/customer/agendamentos",
  linkAvaliacao: "https://jsbarbearia.com/customer/agendamentos",
};
const professional = {
  ...appointment, linkPainel: "https://jsbarbearia.com/barber",
  telefoneCliente: "Não informado nesta demonstração",
  observacoes: "Exemplo de observação informada pelo cliente.",
};
const code = {
  ...theme, nomeCliente: "Wadisson (exemplo)", codigoVerificacao: "00123456",
  contexto: "seu cadastro", linkAcao: "https://jsbarbearia.com/login",
  rotuloAcao: "Acessar JS Barbearia",
};

async function main() {
  config({ quiet: true });
  const samples: Sample[] = [];
  const add = (slug: string, email: Omit<Sample, "slug">) => samples.push({ slug, ...email });
  add("01-cliente-confirmacao", customer.renderCustomerAppointmentConfirmationEmail(appointment));
  add("02-cliente-conclusao", customer.renderCustomerAppointmentCompletedEmail(appointment));
  add("03-cliente-cancelamento", customer.renderCustomerAppointmentCancelledEmail({ ...appointment, motivoCancelamento: "Exemplo: cancelamento solicitado pelo cliente." }));
  add("04-cliente-lembrete", customer.renderCustomerAppointmentReminderEmail(appointment));
  add("05-cliente-remarcacao", customer.renderCustomerAppointmentRescheduledEmail({ ...appointment, horarioAntigo: "25/09/2026 às 13:00", novoHorario: "25/09/2026 às 14:00" }));
  add("06-cadastro-verificacao", customer.renderCustomerVerificationCodeEmail(code));
  add("07-recuperacao-senha", customer.renderCustomerPasswordResetEmail({ ...code, contexto: "a recuperação de senha" }));
  add("08-barbeiro-novo-agendamento", barber.renderBarberNewAppointmentEmail(professional));
  add("09-barbeiro-cancelamento", barber.renderBarberAppointmentCancelledEmail(professional));
  add("10-barbeiro-remarcacao", barber.renderBarberAppointmentRescheduledEmail({ ...professional, horarioAntigo: "25/09/2026 às 13:00", novoHorario: "25/09/2026 às 14:00" }));
  add("11-barbeiro-agenda-diaria", barber.renderBarberDailyAgendaEmail({ ...professional, quantidadeAtendimentos: 2, atendimentos: [
    { horario: "14:00", cliente: "Cliente de exemplo 1", servico: "Cabelo + Sobrancelha" },
    { horario: "16:00", cliente: "Cliente de exemplo 2", servico: "Barba + toalha", observacoes: "Exemplo de observação." },
  ] }));
  add("12-barbeiro-falta", barber.renderBarberNoShowEmail(professional));
  add("13-barbeiro-avaliacao", barber.renderBarberNewReviewEmail({ ...professional, nota: 5, comentario: "Exemplo de avaliação: gostei muito do atendimento!" }));
  for (const isDueToday of [false, true]) {
    const slug = isDueToday ? "15-vip-vence-hoje" : "14-vip-vencimento-proximo";
    const subject = isDueToday ? "Seu plano mensal vence hoje - JS Barbearia" : "Seu plano mensal está perto do vencimento - JS Barbearia";
    add(slug, { subject, text: "Demonstração do modelo de plano mensal. Os planos continuam ocultos na JS Barbearia; não é uma cobrança real.", html: renderVipPaymentEmail({ customerName: "Wadisson (exemplo)", shopName: theme.nomeBarbearia, planName: "Plano demonstrativo", amount: "R$ 0,00 (exemplo)", dueDateLabel: "25 de setembro de 2026", actionUrl: "https://jsbarbearia.com/customer", isDueToday }) });
  }
  add("16-troca-email-verificacao", customer.renderCustomerVerificationCodeEmail({ ...code, contexto: "a alteração do seu e-mail" }));

  const out = resolve("email-previews");
  await mkdir(out, { recursive: true });
  for (const sample of samples) {
    sample.subject = `[PRÉVIA JS] ${sample.subject}`;
    sample.text = `AMOSTRA VISUAL — dados fictícios, sem reserva, cobrança ou código válido.\n\n${sample.text}`;
    const banner = '<div style="padding:12px;background:#e5e5e5;color:#111;text-align:center;font:12px Arial,sans-serif">AMOSTRA VISUAL · Dados fictícios, sem reserva, cobrança ou código válido.</div>';
    sample.html = /<body[^>]*>/i.test(sample.html) ? sample.html.replace(/<body[^>]*>/i, (match) => match + banner) : banner + sample.html;
    await writeFile(resolve(out, `${sample.slug}.html`), sample.html);
    await writeFile(resolve(out, `${sample.slug}.txt`), sample.text);
  }
  await writeFile(resolve(out, "index.html"), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>E-mails JS Barbearia</title><body style="font:16px Arial;background:#101010;color:#eee;padding:24px"><h1>E-mails JS Barbearia</h1><p>Amostras com dados fictícios.</p><ul>${samples.map(x => `<li style="margin:16px 0"><a style="color:#ddd" href="${x.slug}.html">${x.slug}</a></li>`).join("")}</ul></body>`);
  console.log(`${samples.length} prévias geradas em ${out}.`);
  if (!process.argv.includes("--send")) return;
  const toIndex = process.argv.indexOf("--to");
  const to = toIndex < 0 ? "" : process.argv[toIndex + 1];
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("Informe --to com um e-mail válido.");
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error("Configure RESEND_API_KEY e EMAIL_FROM.");
  const manifestPath = resolve(out, "sent.json");
  const manifest: Array<{ slug: string; to: string; subject: string; id: string; hash: string }> = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "[]"));
  for (const sample of samples) {
    const hash = createHash("sha256").update(to + sample.html + sample.text).digest("hex");
    if (manifest.some(x => x.hash === hash)) { console.log(`Já enviada: ${sample.slug}`); continue; }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `js-preview-${hash}` },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject: sample.subject, html: sample.html, text: sample.text, reply_to: "jeansantana24005@gmail.com" }),
    });
    const result = await response.json();
    if (!response.ok || !result.id) throw new Error(`Falha em ${sample.slug}: HTTP ${response.status} ${result.message || "resposta inválida"}`);
    manifest.push({ slug: sample.slug, to, subject: sample.subject, id: result.id, hash });
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`Enviada: ${sample.slug} (${result.id})`);
    await delay(1100);
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
