import assert from "node:assert/strict";
import test from "node:test";
import { getPostLoginRedirect } from "../lib/authRedirect";

test("a barber with shop admin access enters the admin panel", () => {
  assert.equal(getPostLoginRedirect("BARBER", true), "/admin");
});

test("a regular barber continues entering the barber panel", () => {
  assert.equal(getPostLoginRedirect("BARBER", false), "/barber");
});
