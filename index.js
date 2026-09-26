import { mailStatus, himalayaList, notmuchSearch, mailUnread } from "./lib/mail.js";

export const name = "dsh-wsl-mail";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  if (config.enabled === false) {
    console.log("[dsh-wsl-mail] disabled");
    return;
  }
  const timeoutMs = positive(config.timeoutMs, 30_000);
  console.log("[dsh-wsl-mail] list/search only — no send");

  ctx.systemPrompt.section({
    name: "tool:mail",
    order: 139,
    text: "dsh-wsl-mail lists mail via himalaya envelopes or notmuch search. Prefer mail_unread for a quick unread check. It does not send or delete mail. Configure himalaya/notmuch yourself; never paste IMAP passwords into chat.",
  });

  ctx.tools.register({
    name: "mail_status",
    description: "Whether himalaya / notmuch are on PATH.",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: { schema: { type: "object", additionalProperties: true }, render: (_a, v) => [{ type: "text", text: JSON.stringify(v, null, 2) }] },
    timeoutMs: 5_000,
    isConcurrencySafe: () => true,
    async execute() {
      return mailStatus();
    },
    presentCall: () => ({ card: "generic", title: "mail status" }),
    presentResult: (_a, r) => ({ card: "generic", title: "mail status", content: r.content }),
  });

  ctx.tools.register({
    name: "mail_unread",
    description: "Unread mail count (notmuch tag:unread preferred; else recent himalaya INBOX). Read-only.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { limit: { type: "number" } },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [
        {
          type: "text",
          text:
            v.ok === false
              ? v.error
              : `backend=${v.backend} count=${v.count}${v.note ? `\n${v.note}` : ""}\n${JSON.stringify(v.samples || v.envelopes || [], null, 2)}`,
        },
      ],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await mailUnread({ limit: args?.limit, timeoutMs });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "mail unread" }),
    presentResult: (_a, r) => ({ card: "generic", title: "mail unread", content: r.content }),
  });

  ctx.tools.register({
    name: "mail_list",
    description: "himalaya envelope list (folder, capped).",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        folder: { type: "string" },
        limit: { type: "number" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [
        {
          type: "text",
          text:
            v.ok === false
              ? v.error
              : (v.envelopes || []).map((e) => `${e.id}\t${e.date}\t${e.subject}`).join("\n") ||
                v.output ||
                "(none)",
        },
      ],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await himalayaList({ folder: args?.folder, limit: args?.limit, timeoutMs });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "mail list" }),
    presentResult: (_a, r) => ({ card: "generic", title: "mail list", content: r.content }),
  });

  ctx.tools.register({
    name: "mail_notmuch",
    description: "notmuch search --format=json (capped).",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["query"],
      properties: { query: { type: "string" }, limit: { type: "number" } },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : JSON.stringify(v.results || v.output, null, 2) }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await notmuchSearch({ query: args.query, limit: args.limit, timeoutMs });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "notmuch" }),
    presentResult: (_a, r) => ({ card: "generic", title: "notmuch", content: r.content }),
  });
}

function positive(v, fb) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
}
