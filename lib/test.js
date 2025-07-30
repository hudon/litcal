import test from "node:test";
import assert from "node:assert";

import { getCelebrations } from './main.js';

test("getCelebrations returns an error if date is not available", (t) => {
  assert.throws(
    () => {
      getCelebrations(new Date(1900, 0, 1));
    },
    new Error("date unavailable")
  );
});

test("getCelebrations returns an Array for LitCelebrations for an available date", (t) => {
  const res = getCelebrations(new Date(2025, 11, 25));
  assert.equals(res.length, 1);
});
