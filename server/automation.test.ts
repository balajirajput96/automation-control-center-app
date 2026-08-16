import { describe, expect, it } from "vitest";
import { allowedBadgeStatuses, implementationDependencies, implementationRows, serviceStatuses } from "../shared/automationData";
import { getDefaultAutomationSchedules } from "./db";

describe("automation control center data contracts", () => {
  it("limits service badge labels to active, prepared, or blocked", () => {
    expect(allowedBadgeStatuses).toEqual(["active", "prepared", "blocked"]);
    expect(serviceStatuses.every(service => allowedBadgeStatuses.includes(service.status))).toBe(true);
  });

  it("preserves the required schedule labels and Drive folder evidence", () => {
    expect(serviceStatuses.find(service => service.id === "drive")?.summary).toBe("Report folder available");
    expect(implementationRows).toHaveLength(12);
    expect(implementationRows[0]?.[0]).toBe("Private GitHub control center");
    expect(implementationRows.at(-1)?.[0]).toBe("GitHub Actions validation");
    expect(implementationDependencies).toHaveLength(5);
  });

  it("supplies both exact configured daily schedules when the database is unavailable", () => {
    const schedules = getDefaultAutomationSchedules();
    expect(schedules.map(schedule => schedule.displayTime)).toEqual([
      "08:00 (Gemini Spark briefing)",
      "09:15 IST (Daily Automation Control and Antigravity Review)",
    ]);
  });
});
