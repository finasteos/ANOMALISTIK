// Tests for src/server/security.ts rate limiter (TASKLIST B3/Q3).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rateLimit, __resetRateBuckets } from "../src/server/security";

function mockCtx(path = "/api/ai/search-grounded") {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: unknown = null;
  let nextCalled = false;
  const req: any = { ip: "127.0.0.1", path, socket: {} };
  const res: any = {
    setHeader: (k: string, v: string) => { headers[k] = v; },
    status: (c: number) => { statusCode = c; return res; },
    json: (b: unknown) => { body = b; return res; },
  };
  const next = () => { nextCalled = true; };
  return { req, res, next, headers, get status() { return statusCode; }, get jsonBody() { return body; }, get passed() { return nextCalled; } };
}

describe("rateLimit", () => {
  it("passes under cap, 429s at cap with Retry-After", () => {
    __resetRateBuckets();
    const gate = rateLimit(3, 60_000);
    for (let i = 0; i < 3; i++) {
      const c = mockCtx();
      gate(c.req, c.res, c.next);
      assert.equal(c.passed, true);
    }
    const blocked = mockCtx();
    gate(blocked.req, blocked.res, blocked.next);
    assert.equal(blocked.passed, false);
    assert.equal(blocked.status, 429);
    assert.ok(blocked.headers["Retry-After"]);
    assert.match(String((blocked.jsonBody as any)?.error || ""), /Rate limit/);
  });

  it("buckets are per path", () => {
    __resetRateBuckets();
    const gate = rateLimit(1, 60_000);
    const a = mockCtx("/api/ai/a");
    gate(a.req, a.res, a.next);
    assert.equal(a.passed, true);
    const b = mockCtx("/api/ai/b");
    gate(b.req, b.res, b.next);
    assert.equal(b.passed, true);
  });
});
