import type { SystemBillingPayment } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createScheduleDate,
  getCurrentScheduleDateValue,
  getScheduleDateValue,
} from "@/lib/scheduleTime";
import { formatCurrency } from "@/lib/utils";

export const SYSTEM_BILLING_OWNER_EMAIL = process.env.SYSTEM_BILLING_OWNER_EMAIL?.trim().toLowerCase() || "";
export const SYSTEM_BILLING_PAYMENT_URL = process.env.SYSTEM_BILLING_PAYMENT_URL?.trim() || "";
export const SYSTEM_BILLING_GRACE_DAYS = 7;
export const DEFAULT_SYSTEM_BILLING_AMOUNT = Number(process.env.SYSTEM_BILLING_AMOUNT || "0");
export const SYSTEM_BILLING_DUE_DAY = Number(process.env.SYSTEM_BILLING_DUE_DAY || "5");

export function isSystemBillingConfigured() {
  return (
    process.env.SYSTEM_BILLING_ENABLED === "true" &&
    Boolean(SYSTEM_BILLING_OWNER_EMAIL && SYSTEM_BILLING_PAYMENT_URL.startsWith("https://")) &&
    Number.isFinite(DEFAULT_SYSTEM_BILLING_AMOUNT) &&
    DEFAULT_SYSTEM_BILLING_AMOUNT > 0 &&
    Number.isInteger(SYSTEM_BILLING_DUE_DAY) &&
    SYSTEM_BILLING_DUE_DAY >= 1 && SYSTEM_BILLING_DUE_DAY <= 28
  );
}

export type SystemBillingAlert = {
  paymentId: string;
  cycleMonth: string;
  amountLabel: string;
  dueDateLabel: string;
  graceDateLabel: string;
  paymentUrl: string;
  isOverdue: boolean;
  canMarkPaid: boolean;
} | null;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getCycleMonth(dateValue: string) {
  return dateValue.slice(0, 7);
}

export function getSystemBillingDueDate(cycleMonth: string) {
  const [yearValue, monthValue] = cycleMonth.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  return createScheduleDate(
    `${year}-${pad(month)}-${pad(SYSTEM_BILLING_DUE_DAY)}`,
    "00:00"
  )!;
}

function addCalendarDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function isPaid(payment: Pick<SystemBillingPayment, "status" | "paidAt">) {
  return payment.status === "PAID" || Boolean(payment.paidAt);
}

export async function getSystemBillingAlert({
  shopId,
  userEmail,
  now = new Date(),
}: {
  shopId: string;
  userEmail?: string | null;
  now?: Date;
}): Promise<SystemBillingAlert> {
  if (!isSystemBillingConfigured()) return null;

  const todayValue = getCurrentScheduleDateValue(now);
  const cycleMonth = getCycleMonth(todayValue);
  const dueDate = getSystemBillingDueDate(cycleMonth);
  const graceEndsAt = addCalendarDays(dueDate, SYSTEM_BILLING_GRACE_DAYS);
  const amount = DEFAULT_SYSTEM_BILLING_AMOUNT;

  const payment = await prisma.systemBillingPayment.upsert({
    where: {
      shopId_cycleMonth: {
        shopId,
        cycleMonth,
      },
    },
    create: {
      shopId,
      cycleMonth,
      amount,
      dueDate,
      graceEndsAt,
      notes: "Mensalidade do sistema da barbearia.",
    },
    update: {
      amount,
      dueDate,
      graceEndsAt,
    },
  });

  if (isPaid(payment) || todayValue < getScheduleDateValue(dueDate)) {
    return null;
  }

  return {
    paymentId: payment.id,
    cycleMonth,
    amountLabel: formatCurrency(payment.amount),
    dueDateLabel: formatLongDate(dueDate),
    graceDateLabel: formatLongDate(graceEndsAt),
    paymentUrl: SYSTEM_BILLING_PAYMENT_URL,
    isOverdue: todayValue > getScheduleDateValue(dueDate),
    canMarkPaid:
      userEmail?.trim().toLowerCase() === SYSTEM_BILLING_OWNER_EMAIL,
  };
}
