import { describe, expect, it } from "vitest";
import { assetStatus, countByLevel, worstLevel } from "./status-engine";

const now = new Date("2026-10-09T18:00:00Z");

describe("assetStatus", () => {
  it("sin lecturas → unknown (nunca reportó)", () => {
    expect(assetStatus(null, 300, now)).toEqual({ level: "unknown", reason: "never" });
  });

  it("lectura reciente → nivel de la lectura", () => {
    const r = { ts: "2026-10-09T17:58:00Z", level: "warn" as const };
    expect(assetStatus(r, 300, now)).toEqual({ level: "warn", reason: "reading" });
  });

  it("justo en 2× el intervalo todavía no es stale", () => {
    const r = { ts: "2026-10-09T17:50:00Z", level: "ok" as const };
    expect(assetStatus(r, 300, now)).toEqual({ level: "ok", reason: "reading" });
  });

  it("pasado 2× el intervalo → crit stale, aunque la última fuera ok", () => {
    const r = { ts: "2026-10-09T17:49:59Z", level: "ok" as const };
    expect(assetStatus(r, 300, now)).toEqual({ level: "crit", reason: "stale" });
  });
});

describe("worstLevel", () => {
  it("sin assets → unknown", () => expect(worstLevel([])).toBe("unknown"));
  it("todos unknown → unknown", () => expect(worstLevel(["unknown", "unknown"])).toBe("unknown"));
  it("ok le gana a unknown", () => expect(worstLevel(["unknown", "ok"])).toBe("ok"));
  it("crit > warn > ok", () => {
    expect(worstLevel(["ok", "warn"])).toBe("warn");
    expect(worstLevel(["warn", "crit", "ok"])).toBe("crit");
  });
});

describe("countByLevel", () => {
  it("cuenta cada nivel", () => {
    expect(countByLevel(["ok", "crit", "unknown", "unknown"])).toEqual({
      ok: 1, warn: 0, crit: 1, unknown: 2,
    });
  });
});
