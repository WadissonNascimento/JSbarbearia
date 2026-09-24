import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { basePrisma } from "../lib/prisma-core";
import { resolveEmailLogoUrl } from "../lib/emailLogo";
import { isEmailDeliverySuccessful, sendEmailMessage } from "../lib/mail";
import { notifyCustomerAppointmentConfirmed, sendDueAppointmentReminderEmails } from "../lib/appointmentEmails";
import { notifyBarberNewAppointment } from "../lib/barberEmails";

type Log = { status: string; sentAt: Date | null; attempts: number };

function replaceMethod(t: TestContext, target: object, key: string, implementation: unknown) {
  const original = Reflect.get(target, key);
  Reflect.set(target, key, implementation);
  t.after(() => { Reflect.set(target, key, original); });
}

function prepare(t: TestContext) {
  const originalEnv = { ...process.env };
  process.env.EMAIL_PROVIDER = "resend";
  process.env.RESEND_API_KEY = "test-key-only";
  process.env.EMAIL_FROM = "notify@example.invalid";
  process.env.NODE_ENV = "production";
  t.after(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  const logs = new Map<string, Log>();
  replaceMethod(t, basePrisma.emailDeliveryLog, "findUnique", async (args: { where: unknown }) =>
    logs.get(JSON.stringify(args.where)) || null
  );
  replaceMethod(t, basePrisma.emailDeliveryLog, "upsert", async (args: { where: unknown; create: Log; update: Log }) => {
    const key = JSON.stringify(args.where);
    const log = logs.has(key) ? args.update : args.create;
    logs.set(key, log);
    return log;
  });
  replaceMethod(t, basePrisma.shop, "findUnique", async () => ({
    name: "JS Barbearia",
    emailSettings: { fromName: "JS Barbearia", replyToEmail: "jean@example.invalid" },
  }));
  replaceMethod(t, basePrisma.appNotification, "findUnique", async () => ({ id: "notification" }));
  replaceMethod(t, basePrisma.appNotification, "upsert", async () => ({ id: "notification" }));
  return logs;
}

const message = {
  to: "customer@example.invalid",
  subject: "Agendamento confirmado",
  text: "Seu horário está reservado.",
  html: "<p>Seu horário está reservado.</p>",
  template: "customer.appointment_confirmation",
  eventKey: "test-event",
  shopId: "shop_js_barbearia",
};

function appointmentFixture() {
  return {
    id: "appointment-test", shopId: "shop_js_barbearia", publicId: 1,
    customerId: "customer-test", date: new Date("2026-09-24T09:00:00.000Z"),
    notes: null,
    shop: {
      id: "shop_js_barbearia", name: "JS Barbearia", primaryDomain: "jsbarbearia.com",
      logoPath: "/brands/js-barbearia/logo-header-transparent.png", brandColor: "#c8c8c8",
      addressLine: "Rua Gomes Cardim, 271 - Brás", whatsappNumber: "11970718000", emailSettings: null,
    },
    customer: { id: "customer-test", name: "Cliente teste", email: "customer@example.invalid", phone: "11999990000" },
    barber: { id: "barber-test", name: "Jean Santana", email: "jean@example.invalid" },
    services: [{ nameSnapshot: "Cabelo", priceSnapshot: 40, durationSnapshot: 35, orderIndex: 0 }],
    items: [],
  };
}

test("Resend retries use one idempotency key, preserve the shared address and identify JS", async (t) => {
  const logs = prepare(t);
  const requests: RequestInit[] = [];
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    assert.equal(url, "https://api.resend.com/emails");
    requests.push(init);
    return requests.length === 1
      ? Response.json({ message: "Temporary failure" }, { status: 503 })
      : Response.json({ id: "resend-test" });
  });
  const result = await sendEmailMessage({ ...message, fromName: "JS Barbearia", replyTo: "jean@example.invalid" });
  assert.equal(result.sent, true);
  assert.equal(result.attempts, 2);
  const keys = requests.map(request => new Headers(request.headers).get("Idempotency-Key"));
  assert.match(keys[0]!, /^[a-f0-9]{64}$/);
  assert.equal(keys[0], keys[1]);
  const body = JSON.parse(String(requests[0].body));
  assert.equal(body.from, "JS Barbearia <notify@example.invalid>");
  assert.deepEqual(body.reply_to, ["jean@example.invalid"]);
  assert.equal([...logs.values()][0].status, "SENT");
  assert.ok([...logs.values()][0].sentAt instanceof Date);

  const repeated = await sendEmailMessage(message);
  assert.equal(repeated.sent, false);
  assert.equal(repeated.alreadySent, true);
  assert.equal(isEmailDeliverySuccessful(repeated), true);
  assert.equal(requests.length, 2);
});

test("idempotency is isolated by shop and recipient", async (t) => {
  prepare(t);
  const keys: string[] = [];
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    keys.push(new Headers(init.headers).get("Idempotency-Key")!);
    return Response.json({ id: "test" });
  });
  await sendEmailMessage(message);
  await sendEmailMessage({ ...message, shopId: "another-shop" });
  await sendEmailMessage({ ...message, to: "other@example.invalid" });
  assert.equal(new Set(keys).size, 3);
});

test("configured-provider failures stay failures even during local development", async (t) => {
  const logs = prepare(t);
  process.env.NODE_ENV = "development";
  t.mock.method(globalThis, "fetch", async () => Response.json({ message: "Invalid API key" }, { status: 401 }));
  const result = await sendEmailMessage(message);
  assert.equal(isEmailDeliverySuccessful(result), false);
  assert.match(result.error!, /Resend 401/);
  assert.equal([...logs.values()][0].status, "FAILED");
  assert.equal([...logs.values()][0].sentAt, null);
});

test("unconfigured development preview is never logged as an actual delivery", async (t) => {
  const logs = prepare(t);
  process.env.NODE_ENV = "development";
  delete process.env.RESEND_API_KEY;
  t.mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected network request"); });
  const result = await sendEmailMessage(message);
  assert.equal(result.developmentOnly, true);
  assert.equal(isEmailDeliverySuccessful(result), false);
  assert.equal([...logs.values()][0].status, "SKIPPED");
  assert.equal([...logs.values()][0].sentAt, null);
});

test("invalid recipient is a failure, not a successful deduplication", async (t) => {
  prepare(t);
  const result = await sendEmailMessage({ ...message, to: "invalid" });
  assert.equal(isEmailDeliverySuccessful(result), false);
  assert.equal(result.skipped, false);
  assert.equal(result.attempts, 0);
});

test("customer and barber notification failures return false without aborting the booking", async (t) => {
  prepare(t);
  replaceMethod(t, basePrisma.appointment, "findUnique", async () => appointmentFixture());
  t.mock.method(globalThis, "fetch", async () => Response.json({ message: "Unavailable" }, { status: 503 }));
  assert.equal(await notifyCustomerAppointmentConfirmed("appointment-test"), false);
  assert.equal(await notifyBarberNewAppointment("appointment-test"), false);
});

test("failed reminders release their claim and can retry; a reschedule can send a new reminder", async (t) => {
  prepare(t);
  const appointment = appointmentFixture();
  let reminderSentAt: Date | null = null;
  let deliveryFails = true;
  const requestKeys: string[] = [];
  replaceMethod(t, basePrisma.appointment, "findMany", async () => reminderSentAt ? [] : [appointment]);
  replaceMethod(t, basePrisma.appointment, "updateMany", async (args: {
    where: { date: Date; reminderSentAt: Date | null };
    data: { reminderSentAt: Date | null };
  }) => {
    assert.equal(args.where.date, appointment.date);
    assert.equal(args.where.reminderSentAt, reminderSentAt);
    reminderSentAt = args.data.reminderSentAt;
    return { count: 1 };
  });
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    requestKeys.push(new Headers(init.headers).get("Idempotency-Key")!);
    return deliveryFails
      ? Response.json({ message: "Unavailable" }, { status: 503 })
      : Response.json({ id: "reminder-test" });
  });
  const now = new Date("2026-09-24T11:30:00.000Z");
  const first = await sendDueAppointmentReminderEmails({ now });
  assert.equal(first.failed, 1);
  assert.equal(first.sent, 0);
  assert.equal(reminderSentAt, null);

  deliveryFails = false;
  const retried = await sendDueAppointmentReminderEmails({ now });
  assert.equal(retried.sent, 1);
  assert.notEqual(reminderSentAt, null);
  assert.equal(requestKeys[0], requestKeys[2]);
  assert.equal((await sendDueAppointmentReminderEmails({ now })).checked, 0);

  reminderSentAt = null;
  appointment.date = new Date("2026-09-25T09:00:00.000Z");
  assert.equal((await sendDueAppointmentReminderEmails({ now })).sent, 1);
  assert.notEqual(requestKeys[2], requestKeys[3]);
});

test("JS emails resolve the complete logo on the shop domain without changing other shops", () => {
  assert.equal(resolveEmailLogoUrl("/brands/js-barbearia/logo-header-transparent.png", { primaryDomain: "jsbarbearia.com" }), "https://jsbarbearia.com/brands/js-barbearia/logo-header-transparent.png?v=email-transparent-20260924");
  assert.equal(resolveEmailLogoUrl("/brand.png", { primaryDomain: "another.example" }), "https://another.example/brand.png");
  assert.equal(resolveEmailLogoUrl("https://cdn.example/logo.png", { primaryDomain: "another.example" }), "https://cdn.example/logo.png");
});
