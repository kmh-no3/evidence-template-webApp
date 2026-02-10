import type { ColumnDefinition } from "@/types";
import { saveAs } from "file-saver";

/**
 * CSVエスケープ処理
 */
function escapeCsvValue(value: string): string {
  // ダブルクォートをエスケープ
  const escaped = value.replace(/"/g, '""');
  
  // カンマ、改行、ダブルクォートを含む場合はクォートで囲む
  if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
    return `"${escaped}"`;
  }
  
  return escaped;
}

/**
 * CSV行を生成
 */
function generateCsvRow(values: string[]): string {
  return values.map(escapeCsvValue).join(",");
}

/**
 * サンプル値を生成
 */
function generateSampleValue(column: ColumnDefinition): string {
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
      // キーに基づいてサンプルデータを生成
      if (column.key === "test_id") return "TC-001";
      if (column.key === "evidence_log_id" || column.key === "evidence_id") return "EVI-001";
      if (column.key === "bug_id") return "BUG-001";
      if (column.key === "related_test_id") return "TC-001";
      if (column.key.includes("executor") || column.key.includes("by")) return "担当者A";
      if (column.key === "process") return "受注→出荷→請求";
      if (column.key === "target") return "伝票タイプ";
      if (column.key === "expected") return "正常に処理される";
      if (column.key === "steps") return "1) 画面を開く\n2) データを入力\n3) 保存する";
      if (column.key === "precondition") return "テストユーザでログイン済み";
      if (column.key === "module") return "FI";
      if (column.key === "system") return "QAS";
      if (column.key === "client") return "100";
      if (column.key === "tcode") return "OBA7";
      if (column.key === "filename") return "screenshot_001.png";
      if (column.key === "storage_path") return "\\\\share\\evidence\\";
      if (column.key === "evidence_description") return "保存後のメッセージ";
      if (column.key === "capture_location") return "伝票作成画面";
      
      return `${column.label}のサンプル`;
  }
}

/**
 * サンプル行を生成
 */
function generateSampleRows(
  columns: ColumnDefinition[],
  count: number
): Record<string, string>[] {
  return Array.from({ length: count }, (_, index) => {
    const row: Record<string, string> = {};
    
    columns.forEach((col) => {
      let value = generateSampleValue(col);
      
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

/**
 * CSVを生成
 */
export function generateCsv(
  columns: ColumnDefinition[],
  options: {
    includeSample: boolean;
  }
): string {
  const rows: string[] = [];

  // ヘッダー行
  const headerRow = generateCsvRow(columns.map((col) => col.label));
  rows.push(headerRow);

  // サンプル行
  if (options.includeSample) {
    const sampleRows = generateSampleRows(columns, 3);
    sampleRows.forEach((rowData) => {
      const values = columns.map((col) => rowData[col.key] || "");
      rows.push(generateCsvRow(values));
    });
  }

  // UTF-8 BOM付きで返す（Excel対応）
  return "\uFEFF" + rows.join("\n");
}

/**
 * CSVファイルをダウンロード
 */
export function downloadCsv(
  columns: ColumnDefinition[],
  options: {
    includeSample: boolean;
    profileName: string;
    level: "lite" | "full";
    sheetName: string;
  }
): void {
  const csvContent = generateCsv(columns, {
    includeSample: options.includeSample,
  });

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8",
  });

  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const sheetLabel = options.sheetName === "test_items" ? "TestItems" : "EvidenceLog";
  const filename = `EvidenceTemplate_${options.profileName}_${options.level}_${sheetLabel}_${today}.csv`;

  saveAs(blob, filename);
}
