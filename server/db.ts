import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { AutomationSchedule, InsertUser, automationSchedules, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

const defaultSchedules = [
  {
    id: "gemini-spark-briefing",
    name: "Gemini Spark briefing",
    displayTime: "08:00 (Gemini Spark briefing)",
    timezone: "Local time",
    detail: "Private, read-only morning briefing for priorities, blockers, and approval-needed items.",
    enabled: true,
    status: "active" as const,
  },
  {
    id: "daily-control-antigravity-review",
    name: "Daily Automation Control and Antigravity Review",
    displayTime: "09:15 IST (Daily Automation Control and Antigravity Review)",
    timezone: "Asia/Kolkata",
    detail: "Private control review with Antigravity audit guidance and GitHub workflow validation.",
    enabled: true,
    status: "active" as const,
  },
];

export function getDefaultAutomationSchedules(): AutomationSchedule[] {
  return defaultSchedules.map(schedule => ({ ...schedule, updatedAt: new Date(0) }));
}

export function scheduleStatusForEnabled(enabled: boolean): "active" | "prepared" {
  return enabled ? "active" : "prepared";
}

async function ensureAutomationSchedules() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: automationSchedules.id }).from(automationSchedules);
  const existingIds = new Set(existing.map(item => item.id));
  const missing = defaultSchedules.filter(schedule => !existingIds.has(schedule.id));
  if (missing.length) await db.insert(automationSchedules).values(missing);
}

export async function getAutomationSchedules(): Promise<AutomationSchedule[]> {
  const db = await getDb();
  if (!db) return getDefaultAutomationSchedules();
  await ensureAutomationSchedules();
  const schedules = await db.select().from(automationSchedules);
  return schedules.sort((left, right) => left.displayTime.localeCompare(right.displayTime));
}

export async function setAutomationScheduleEnabled(id: string, enabled: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await ensureAutomationSchedules();
  await db.update(automationSchedules).set({
    enabled,
    status: scheduleStatusForEnabled(enabled),
    updatedAt: new Date(),
  }).where(eq(automationSchedules.id, id));
}
