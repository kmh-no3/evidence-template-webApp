import type { ColumnDefinition, ColumnDefinitions, Profile } from "@/types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * 列定義辞書を読み込む
 */
export async function loadColumnDefinitions(): Promise<ColumnDefinitions> {
  const response = await fetch(`${basePath}/data/columns.json`);
  if (!response.ok) {
    throw new Error("Failed to load column definitions");
  }
  return response.json();
}

/**
 * 全プロファイル一覧を読み込む
 */
export async function loadProfiles(): Promise<Profile[]> {
  const profileIds = [
    "SAP_Customizing_JP",
    "Generic_Evidence_JP",
    "Development_JP",
  ];

  const profiles = await Promise.all(
    profileIds.map(async (id) => {
      const response = await fetch(`${basePath}/data/profiles/${id}.json`);
      if (!response.ok) {
        console.error(`Failed to load profile: ${id}`);
        return null;
      }
      return response.json() as Promise<Profile>;
    })
  );

  return profiles.filter((p): p is Profile => p !== null);
}

/**
 * 特定のプロファイルを読み込む
 */
export async function loadProfile(profileId: string): Promise<Profile> {
  const response = await fetch(`${basePath}/data/profiles/${profileId}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load profile: ${profileId}`);
  }
  return response.json();
}

/**
 * プロファイルと列定義から、該当する列を抽出
 */
export function getColumnsForProfile(
  profile: Profile,
  columnDefs: ColumnDefinitions,
  sheet: "test_items" | "evidence_log"
): ColumnDefinition[] {
  const columnKeys = sheet === "test_items" ? profile.columns : profile.evidence_columns;

  return columnKeys
    .map((key) => columnDefs[key])
    .filter((col): col is ColumnDefinition => col !== undefined && col.sheet === sheet);
}

/**
 * プロファイルとレベルに基づいてデフォルトで選択される列を取得
 */
export function getDefaultSelectedKeys(
  profile: Profile,
  level: "lite" | "full"
): string[] {
  return profile.levels[level].default_on_keys;
}

/**
 * カテゴリごとに列をグループ化
 */
export function groupColumnsByCategory(columns: ColumnDefinition[]): {
  MUST: ColumnDefinition[];
  RECOMMENDED: ColumnDefinition[];
  OPTIONAL: ColumnDefinition[];
} {
  return {
    MUST: columns.filter((col) => col.category === "MUST"),
    RECOMMENDED: columns.filter((col) => col.category === "RECOMMENDED"),
    OPTIONAL: columns.filter((col) => col.category === "OPTIONAL"),
  };
}

/**
 * 選択されたキーに基づいて列定義を取得
 */
export function getSelectedColumns(
  selectedKeys: string[],
  columnDefs: ColumnDefinitions
): ColumnDefinition[] {
  return selectedKeys
    .map((key) => columnDefs[key])
    .filter((col): col is ColumnDefinition => col !== undefined);
}

/**
 * シートごとに列を分割
 */
export function splitColumnsBySheet(columns: ColumnDefinition[]): {
  test_items: ColumnDefinition[];
  evidence_log: ColumnDefinition[];
} {
  return {
    test_items: columns.filter((col) => col.sheet === "test_items"),
    evidence_log: columns.filter((col) => col.sheet === "evidence_log"),
  };
}

/**
 * サンプル行データを生成
 */
export function generateSampleRow(column: ColumnDefinition): string {
  switch (column.type) {
    case "date":
      return "2026-02-10";
    case "enum":
      return column.enum?.[0] || "";
    case "number":
      return "1";
    case "url":
      return "https://example.com";
    case "text":
    default:
      // 列のキーに基づいてサンプルデータを生成
      if (column.key.includes("id")) {
        return column.key === "test_id" ? "TC-001" : 
               column.key === "evidence_log_id" ? "EVI-001" :
               column.key.includes("bug") ? "BUG-001" : "ID-001";
      }
      if (column.key.includes("executor") || column.key.includes("by")) {
        return "担当者A";
      }
      if (column.key.includes("result") && column.enum) {
        return column.enum[0];
      }
      return `${column.label}のサンプル`;
  }
}

/**
 * 全列のサンプル行を生成
 */
export function generateSampleRows(
  columns: ColumnDefinition[],
  count: number = 3
): Record<string, string>[] {
  return Array.from({ length: count }, (_, index) => {
    const row: Record<string, string> = {};
    columns.forEach((col) => {
      let value = generateSampleRow(col);
      // IDの場合は連番にする
      if (col.key.includes("id") && col.type === "text") {
        const num = String(index + 1).padStart(3, "0");
        value = value.replace(/\d{3}/, num);
      }
      row[col.key] = value;
    });
    return row;
  });
}
