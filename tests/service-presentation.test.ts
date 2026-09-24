import assert from "node:assert/strict";
import test from "node:test";
import { sortServicesForDisplay } from "../lib/servicePresentation";

test("services use the requested leading order and place combos last", () => {
  const services = [
    { name: "Barba + toalha", description: "Barba com toalha." },
    { name: "Cabelo + luzes", description: "Combo promocional." },
    { name: "Barba", description: "Serviço individual." },
    { name: "Sobrancelha", description: "Acabamento." },
    { name: "Pezinho", description: "Acabamento." },
    { name: "Cabelo", description: "Serviço individual." },
  ];

  assert.deepEqual(
    sortServicesForDisplay(services).map((service) => service.name),
    ["Cabelo", "Sobrancelha", "Barba", "Barba + toalha", "Pezinho", "Cabelo + luzes"]
  );
});
