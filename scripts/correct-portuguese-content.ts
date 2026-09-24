import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

config({ quiet: true });
const prisma = new PrismaClient();
const shopId = "shop_js_barbearia";
const replacements = {
  metadataTitle: ["JS Barbearia | Corte classico e acabamento preciso", "JS Barbearia | Corte clássico e acabamento preciso"],
  metadataDescription: ["Agende seu horario na JS Barbearia e viva uma experiencia de cuidado em cada detalhe.", "Agende seu horário na JS Barbearia e viva uma experiência de cuidado em cada detalhe."],
  heroTitle: ["Corte classico, acabamento preciso.", "Corte clássico, acabamento preciso."],
  heroSubtitle: ["Uma experiencia de cuidado pensada para valorizar seu estilo em cada detalhe.", "Uma experiência de cuidado pensada para valorizar seu estilo em cada detalhe."],
  primaryCtaLabel: ["Agendar horario", "Agendar horário"],
  reviewsTitle: ["Confianca construida no atendimento.", "Confiança construída no atendimento."],
  reviewsEmptyText: ["As avaliacoes da JS Barbearia aparecerao aqui em breve.", "As avaliações da JS Barbearia aparecerão aqui em breve."],
} as const;

type Field = keyof typeof replacements;

async function main() {
  const shop = await prisma.shop.findUniqueOrThrow({ where: { id: shopId } });
  if (shop.primaryDomain !== "jsbarbearia.com") throw new Error("Domínio da loja diferente do esperado.");
  const changes = (Object.keys(replacements) as Field[]).flatMap((field) => {
    const [before, after] = replacements[field];
    // Preserve later edits by the owner; only replace the audited legacy copy.
    return shop[field] === before ? [{ field, before, after }] : [];
  });
  const notifications = await prisma.appNotification.findMany({
    where: { shopId, type: { in: ["customer.lembrete_dia", "customer.lembrete"] } },
    select: { id: true, body: true },
  });
  const notificationChanges = notifications.flatMap(({ id, body }) => {
    const after = body.replace(/\bas (?=\d{2}:\d{2}(?:[.!: ]|$))/g, "às ");
    return after !== body ? [{ id, before: body, after }] : [];
  });
  console.log(JSON.stringify({ mode: process.argv.includes("--apply") ? "apply" : "preview", shopId, changes, notificationCount: notificationChanges.length }, null, 2));
  if (!process.argv.includes("--apply") || (!changes.length && !notificationChanges.length)) return;

  const backupPath = join(tmpdir(), `js-portuguese-backup-${Date.now()}.json`);
  await writeFile(backupPath, JSON.stringify({ shopId, changes, notificationChanges }, null, 2), { mode: 0o600 });
  await prisma.$transaction(async (tx) => {
    for (const { field, before, after } of changes) {
      const result = await tx.shop.updateMany({ where: { id: shopId, [field]: before }, data: { [field]: after } });
      if (result.count !== 1) throw new Error(`O campo ${field} mudou durante a revisão.`);
    }
    for (const { id, before, after } of notificationChanges) {
      const result = await tx.appNotification.updateMany({ where: { id, shopId, body: before }, data: { body: after } });
      if (result.count !== 1) throw new Error("Uma notificação mudou durante a revisão.");
    }
  });
  console.log(`Correções aplicadas. Backup local protegido: ${backupPath}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Falha ao corrigir textos."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
