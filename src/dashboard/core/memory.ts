import { MISSION_MODES, type ActionTask, type MissionMode } from "../briefFallback";
import type { IntelStreamEntry, SavedBrief } from "./state";

const STORAGE_KEYS = {
  missionMode: "archaios.core.missionMode",
  savedBriefs: "archaios.core.savedBriefs",
  taskQueue: "archaios.core.taskQueue",
  intelStream: "archaios.core.intelStream"
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadMissionMode(): MissionMode | null {
  const value = readJson<string | null>(STORAGE_KEYS.missionMode, null);
  return value && MISSION_MODES.includes(value as MissionMode) ? value as MissionMode : null;
}

export function saveMissionMode(missionMode: MissionMode) {
  writeJson(STORAGE_KEYS.missionMode, missionMode);
}

export function loadSavedBriefsMemory() {
  return readJson<SavedBrief[]>(STORAGE_KEYS.savedBriefs, []);
}

export function saveSavedBriefsMemory(savedBriefs: SavedBrief[]) {
  writeJson(STORAGE_KEYS.savedBriefs, savedBriefs);
}

export function loadTaskQueueMemory() {
  return readJson<ActionTask[]>(STORAGE_KEYS.taskQueue, []);
}

export function saveTaskQueueMemory(taskQueue: ActionTask[]) {
  writeJson(STORAGE_KEYS.taskQueue, taskQueue);
}

export function loadIntelStreamMemory() {
  return readJson<IntelStreamEntry[]>(STORAGE_KEYS.intelStream, []);
}

export function saveIntelStreamMemory(intelStream: IntelStreamEntry[]) {
  writeJson(STORAGE_KEYS.intelStream, intelStream);
}
