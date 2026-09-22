import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mailStatus } from "../lib/mail.js";
describe("mail", () => {
  it("status", async () => assert.equal((await mailStatus()).ok, true));
});
