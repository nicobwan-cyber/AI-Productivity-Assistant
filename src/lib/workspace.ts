export type WorkspaceItem = {
  id: string;
  title: string;
  tool: string;
  content: string;
  createdAt: number;
};

const KEY = "workspace.items.v1";
const ACTIVITY_KEY = "workspace.activity.v1";
const STREAK_KEY = "workspace.streak.v1";

function read(): WorkspaceItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(items: WorkspaceItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("workspace:change"));
}

export function listItems() {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveItem(item: Omit<WorkspaceItem, "id" | "createdAt">) {
  const items = read();
  const next: WorkspaceItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  items.push(next);
  write(items);
  return next;
}

export function renameItem(id: string, title: string) {
  write(read().map((i) => (i.id === id ? { ...i, title } : i)));
}

export function deleteItem(id: string) {
  write(read().filter((i) => i.id !== id));
}

export function getItem(id: string) {
  return read().find((i) => i.id === id);
}

// ----- Activity / streaks -----
export type ActivityEvent = { tool: string; text: string; time: number };

export function logActivity(tool: string, text: string) {
  if (typeof window === "undefined") return;
  try {
    const list: ActivityEvent[] = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
    list.unshift({ tool, text, time: Date.now() });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list.slice(0, 50)));
    bumpStreak();
    window.dispatchEvent(new Event("workspace:activity"));
  } catch {}
}

export function recentActivity(limit = 6): ActivityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]").slice(0, limit);
  } catch {
    return [];
  }
}

type StreakState = {
  current: number;
  lastDay: string; // YYYY-MM-DD
  toolsToday: string[];
  daysThisWeek: string[]; // YYYY-MM-DD list
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
function weekKey(d = new Date()) {
  const c = new Date(d);
  const day = c.getDay();
  const diff = c.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(c.setDate(diff)).toISOString().slice(0, 10);
}

function bumpStreak() {
  const today = todayKey();
  const raw = localStorage.getItem(STREAK_KEY);
  let s: StreakState = raw
    ? JSON.parse(raw)
    : { current: 0, lastDay: "", toolsToday: [], daysThisWeek: [] };

  if (s.lastDay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    s.current = s.lastDay === yesterday ? s.current + 1 : 1;
    s.lastDay = today;
    s.toolsToday = [];
  }
  if (!s.daysThisWeek.includes(today)) s.daysThisWeek.push(today);
  // prune days outside current week
  const wk = weekKey();
  s.daysThisWeek = s.daysThisWeek.filter((d) => d >= wk);
  localStorage.setItem(STREAK_KEY, JSON.stringify(s));
}

export function getStreak() {
  if (typeof window === "undefined")
    return { current: 0, toolsToday: 0, tasksThisWeek: 0, weekProgress: 0 };
  const raw = localStorage.getItem(STREAK_KEY);
  const s: StreakState = raw
    ? JSON.parse(raw)
    : { current: 0, lastDay: "", toolsToday: [], daysThisWeek: [] };
  const activity = recentActivity(200);
  const today = todayKey();
  const wk = weekKey();
  const toolsToday = new Set(
    activity.filter((a) => new Date(a.time).toISOString().slice(0, 10) === today).map((a) => a.tool),
  );
  const tasksThisWeek = activity.filter(
    (a) => new Date(a.time).toISOString().slice(0, 10) >= wk,
  ).length;
  return {
    current: s.lastDay === today ? s.current : 0,
    toolsToday: toolsToday.size,
    tasksThisWeek,
    weekProgress: Math.min(100, Math.round((s.daysThisWeek.length / 5) * 100)),
  };
}

// onboarding
const ONBOARD_KEY = "workspace.onboarding.v1";
export type OnboardingProfile = { role: string; tone: string; tools: string[]; template?: string };
export function getOnboarding(): OnboardingProfile | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(ONBOARD_KEY) || "null");
  } catch {
    return null;
  }
}
export function setOnboarding(p: OnboardingProfile) {
  localStorage.setItem(ONBOARD_KEY, JSON.stringify(p));
}
