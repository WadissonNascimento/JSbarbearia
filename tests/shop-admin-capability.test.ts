import assert from "node:assert/strict";
import test from "node:test";
import { getPostLoginRedirect } from "../lib/authRedirect";
import { getRequestAwareAppUrl } from "../lib/appUrl";

test("a barber with shop admin access enters the admin panel", () => {
  assert.equal(getPostLoginRedirect("BARBER", true), "/admin");
});

test("a regular barber continues entering the barber panel", () => {
  assert.equal(getPostLoginRedirect("BARBER", false), "/barber");
});

test("login redirects use the public host behind nginx", () => {
  const headers = new Headers({
    host: "localhost:3002",
    "x-forwarded-host": "jsbarbearia.com",
    "x-forwarded-proto": "https",
  });

  assert.equal(
    getRequestAwareAppUrl("http://localhost:3002/login/submit", headers),
    "https://jsbarbearia.com"
  );
});
