import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import webpush from "web-push";
import { basePrisma } from "../lib/prisma-core";
import { sendPushNotificationToUser } from "../lib/webPush";

function replaceMethod(t: TestContext, target: object, key: string, implementation: unknown) {
  const original = Reflect.get(target, key);
  Reflect.set(target, key, implementation);
  t.after(() => Reflect.set(target, key, original));
}

function configure(t: TestContext) {
  const keys = webpush.generateVAPIDKeys();
  const values = {
    NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY: keys.publicKey,
    WEB_PUSH_VAPID_PRIVATE_KEY: keys.privateKey,
    WEB_PUSH_CONTACT: "https://example.invalid",
  };
  for (const [key, value] of Object.entries(values)) {
    const original = process.env[key];
    process.env[key] = value;
    t.after(() => { if (original === undefined) delete process.env[key]; else process.env[key] = original; });
  }
}

const message = { shopId: "shop-js-test", userId: "barber-owner", notificationId: "notice", title: "Novo agendamento", body: "Você tem um novo horário.", url: "/barber" };

test("push targets only active devices belonging to the intended shop and account", async (t) => {
  configure(t);
  replaceMethod(t, basePrisma.pushSubscription, "findMany", async ({ where }: { where: unknown }) => {
    assert.deepEqual(where, { shopId: message.shopId, userId: message.userId, isActive: true });
    return [{ id: "device", endpoint: "https://push.example.invalid/device", p256dh: "public", auth: "auth" }];
  });
  replaceMethod(t, basePrisma.pushSubscription, "update", async ({ data }: { data: Record<string, unknown> }) => {
    assert.equal(data.failureCount, 0);
    assert.ok(data.lastSuccessAt instanceof Date);
  });
  t.mock.method(webpush, "sendNotification", async (_subscription, payload) => {
    const notification = JSON.parse(String(payload));
    assert.equal(notification.title, message.title);
    assert.equal(notification.url, "/barber");
    assert.equal(notification.icon, "/brands/js-barbearia/app-icon-192.png");
  });
  assert.deepEqual(await sendPushNotificationToUser(message), { sent: 1, skipped: false });
});

test("push expires invalid devices but preserves devices after a temporary provider error", async (t) => {
  configure(t);
  replaceMethod(t, basePrisma.pushSubscription, "findMany", async () => [
    { id: "expired", endpoint: "https://push.example.invalid/expired", p256dh: "public", auth: "auth" },
    { id: "temporary", endpoint: "https://push.example.invalid/temporary", p256dh: "public", auth: "auth" },
  ]);
  const updates = new Map<string, Record<string, unknown>>();
  replaceMethod(t, basePrisma.pushSubscription, "update", async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => updates.set(where.id, data));
  t.mock.method(webpush, "sendNotification", async (subscription) => {
    throw Object.assign(new Error("Simulated push provider failure"), { statusCode: subscription.endpoint.endsWith("expired") ? 410 : 503 });
  });
  t.mock.method(console, "warn", () => undefined);
  assert.deepEqual(await sendPushNotificationToUser(message), { sent: 0, skipped: false });
  assert.equal(updates.get("expired")?.isActive, false);
  assert.equal(updates.get("temporary")?.isActive, undefined);
  assert.deepEqual(updates.get("temporary")?.failureCount, { increment: 1 });
});
