import "server-only";

import { renderVipPaymentEmail } from "@/lib/email/vipTemplates";

import { createAppNotificationSafely } from "@/lib/appNotifications";
import { getShopAppUrl } from "@/lib/appUrl";
import { sendEmailMessage } from "@/lib/mail";
import { basePrisma } from "@/lib/prisma-core";
import {
  getCurrentScheduleDateValue,
  getScheduleDateValue,
} from "@/lib/scheduleTime";
import { formatCurrency } from "@/lib/utils";
import { getVipCycle, getVipPaymentDueDate } from "@/lib/vip";

const VIP_PAYMENT_ADVANCE_DAYS = 3;

function parseScheduleDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

function addUtcDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function sendVipPaymentDueNotifications() {
  const todayValue = getCurrentScheduleDateValue();
  const todayDate = parseScheduleDateValue(todayValue);
  const { cycleMonth } = getVipCycle(todayDate);
  const subscriptions = await basePrisma.vipSubscription.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      plan: true,
      shop: {
        select: {
          id: true,
          name: true,
          primaryDomain: true,
          emailSettings: {
            select: {
              fromName: true,
            },
          },
        },
      },
      payments: {
        where: {
          cycleMonth,
        },
        take: 1,
      },
    },
  });

  let checked = 0;
  let notified = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    checked += 1;
    const dueDate = getVipPaymentDueDate(todayDate, subscription.dueDay);
    const dueDateValue = getScheduleDateValue(dueDate);
    const advanceDateValue = getScheduleDateValue(
      addUtcDays(dueDate, -VIP_PAYMENT_ADVANCE_DAYS)
    );
    const kind =
      todayValue === dueDateValue
        ? "due"
        : todayValue === advanceDateValue
        ? "advance"
        : null;

    await basePrisma.vipPayment.upsert({
      where: {
        shopId_subscriptionId_cycleMonth: {
          shopId: subscription.shopId,
          subscriptionId: subscription.id,
          cycleMonth,
        },
      },
      update: {
        dueDate,
        amount: subscription.plan.price,
        notes: `Vence todo dia ${subscription.dueDay}`,
      },
      create: {
        shopId: subscription.shopId,
        subscriptionId: subscription.id,
        cycleMonth,
        amount: subscription.plan.price,
        status: "PENDING",
        dueDate,
        notes: `Vence todo dia ${subscription.dueDay}`,
      },
    });

    if (!kind || subscription.payments[0]?.status === "PAID") {
      skipped += 1;
      continue;
    }

    const dueDateLabel = formatDateLabel(dueDate);
    const planUrl = `${getShopAppUrl(subscription.shop)}/planos`;
    const amountLabel = formatCurrency(Number(subscription.plan.price));
    const customerName =
      subscription.customer.name?.trim() ||
      subscription.customer.email?.split("@")[0] ||
      "cliente";
    const isDueToday = kind === "due";
    const title = isDueToday
      ? "Seu plano mensal vence hoje"
      : "Seu plano mensal está perto do vencimento";
    const body = isDueToday
      ? `O plano ${subscription.plan.name} vence hoje. Valor: ${amountLabel}.`
      : `Seu plano ${subscription.plan.name} vence em ${dueDateLabel}. Valor: ${amountLabel}.`;
    const eventKey = `vip-payment-${kind}-${subscription.id}-${cycleMonth}`;

    const notification = await createAppNotificationSafely({
      shopId: subscription.shopId,
      recipientUserId: subscription.customer.id,
      type: "vip_payment_due",
      eventKey,
      eyebrow: "Plano mensal",
      title,
      body,
      actionUrl: "/planos",
      metadata: {
        subscriptionId: subscription.id,
        planName: subscription.plan.name,
        cycleMonth,
        dueDay: subscription.dueDay,
        dueDate: dueDateValue,
        amount: Number(subscription.plan.price),
      },
    });

    if (notification) {
      notified += 1;
    }

    if (!subscription.customer.email) {
      skipped += 1;
      continue;
    }

    try {
      const result = await sendEmailMessage({
        to: subscription.customer.email,
        subject: `${title} - ${subscription.shop.name}`,
        text: `${title}. O plano ${subscription.plan.name} vence em ${dueDateLabel}. Valor: ${amountLabel}.`,
        html: renderVipPaymentEmail({
          customerName,
          shopName:
            subscription.shop.emailSettings?.fromName?.trim() ||
            subscription.shop.name,
          planName: subscription.plan.name,
          amount: amountLabel,
          dueDateLabel,
          actionUrl: planUrl,
          isDueToday,
        }),
        template: "vip-payment-due",
        eventKey,
        shopId: subscription.shopId,
        recipientUserId: subscription.customer.id,
        fromName:
          subscription.shop.emailSettings?.fromName?.trim() ||
          subscription.shop.name,
        metadata: {
          subscriptionId: subscription.id,
          cycleMonth,
          dueDay: subscription.dueDay,
          dueDate: dueDateValue,
          kind,
        },
      });

      if (result.sent) {
        sent += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      failed += 1;
      console.warn(
        `[vip-payment] Falha ao enviar aviso ${eventKey}: ${
          error instanceof Error ? error.message : "erro desconhecido"
        }`
      );
    }
  }

  return {
    checked,
    notified,
    sent,
    failed,
    skipped,
    date: todayValue,
  };
}
