import type { UserPreferences } from "@/types";

const STORAGE_KEY = "evidence_template_preferences";

/**
 * ブラウザ環境かどうかをチェック
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * ユーザー設定をLocalStorageから読み込む
 */
export function loadPreferences(): UserPreferences | null {
  if (!isBrowser()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as UserPreferences;
  } catch (error) {
    console.error("Failed to load preferences:", error);
    return null;
  }
}

/**
 * ユーザー設定をLocalStorageに保存
 */
export function savePreferences(preferences: UserPreferences): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Failed to save preferences:", error);
  }
}

/**
 * 特定のプロファイルとレベルの選択列を保存
 */
export function saveSelectedColumns(
  profileId: string,
  level: "lite" | "full",
  selectedKeys: string[]
): void {
  const current = loadPreferences() || {};
  const selectedColumns = current.selected_columns || {};

  if (!selectedColumns[profileId]) {
    selectedColumns[profileId] = {};
  }

  selectedColumns[profileId][level] = selectedKeys;

  savePreferences({
    ...current,
    selected_columns: selectedColumns,
  });
}

/**
 * 特定のプロファイルとレベルの選択列を読み込む
 */
export function loadSelectedColumns(
  profileId: string,
  level: "lite" | "full"
): string[] | null {
  const preferences = loadPreferences();
  if (!preferences?.selected_columns) return null;

  return preferences.selected_columns[profileId]?.[level] || null;
}

/**
 * プロファイルIDを保存
 */
export function saveProfileId(profileId: string): void {
  const current = loadPreferences() || {};
  savePreferences({
    ...current,
    profile_id: profileId,
  });
}

/**
 * レベルを保存
 */
export function saveLevel(level: "lite" | "full"): void {
  const current = loadPreferences() || {};
  savePreferences({
    ...current,
    level,
  });
}

/**
 * フォーマットを保存
 */
export function saveFormat(format: "xlsx" | "csv"): void {
  const current = loadPreferences() || {};
  savePreferences({
    ...current,
    format,
  });
}

/**
 * サンプル行含むフラグを保存
 */
export function saveIncludeSample(includeSample: boolean): void {
  const current = loadPreferences() || {};
  savePreferences({
    ...current,
    include_sample: includeSample,
  });
}

/**
 * CSVシート選択を保存
 */
export function saveCsvSheet(csvSheet: "test_items" | "evidence_log"): void {
  const current = loadPreferences() || {};
  savePreferences({
    ...current,
    csv_sheet: csvSheet,
  });
}

/**
 * 設定をクリア
 */
export function clearPreferences(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear preferences:", error);
  }
}
