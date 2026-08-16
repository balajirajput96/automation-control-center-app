import { describe, expect, it } from "vitest";
import { allowedBadgeStatuses, implementationRows, serviceStatuses } from "./automationData";

describe("automation dashboard source data", () => {
  it("limits service badges to the required status vocabulary", () => {
    expect(serviceStatuses.every(service => allowedBadgeStatuses.includes(service.status))).toBe(true);
  });

  it("preserves every completed-work row from the implementation status report", () => {
    expect(implementationRows).toHaveLength(12);
    expect(implementationRows[0]?.[0]).toBe("Private GitHub control center");
    expect(implementationRows.at(-1)?.[0]).toBe("GitHub Actions validation");
  });
});
