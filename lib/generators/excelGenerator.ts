import type { Workbook } from "exceljs";
import type { ColumnDefinition, SheetData } from "@/types";
import { saveAs } from "file-saver";

/**
 * カテゴリに基づく背景色を取得
 */
function getCategoryColor(category: "MUST" | "RECOMMENDED" | "OPTIONAL"): string {
  switch (category) {
    case "MUST":
      return "FFE6F2FF"; // 薄い青
    case "RECOMMENDED":
      return "FFFFF4E6"; // 薄いオレンジ
    case "OPTIONAL":
      return "FFF0F0F0"; // 薄いグレー
  }
}

/**
 * Excelワークブックを生成
 */
export async function generateExcelFile(
  testItemsColumns: ColumnDefinition[],
  evidenceLogColumns: ColumnDefinition[],
  options: {
    includeSample: boolean;
    profileName: string;
    level: "lite" | "full";
  }
): Promise<Blob> {
  // 動的インポート（バンドルサイズ削減）
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  // メタデータ設定
  workbook.creator = "Evidence Template Generator";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  // テスト項目表シート
  if (testItemsColumns.length > 0) {
    createSheet(
      workbook,
      "テスト項目表",
      testItemsColumns,
      options.includeSample
    );
  }

  // 証跡ログシート
  if (evidenceLogColumns.length > 0) {
    createSheet(
      workbook,
      "証跡ログ",
      evidenceLogColumns,
      options.includeSample
    );
  }

  // Blobとして返す
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * シートを作成
 */
function createSheet(
  workbook: Workbook,
  sheetName: string,
  columns: ColumnDefinition[],
  includeSample: boolean
): void {
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", xSplit: 0, ySplit: 1 }],
  });

  // ヘッダー行を追加
  const headerRow = worksheet.addRow(columns.map((col) => col.label));

  // ヘッダーのスタイル設定
  headerRow.eachCell((cell, colNumber) => {
    const column = columns[colNumber - 1];
    
    cell.font = {
      bold: true,
      size: 11,
      color: { argb: "FF000000" },
    };
    
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: getCategoryColor(column.category) },
    };
    
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
  });

  // 列幅を自動調整
  columns.forEach((col, index) => {
    const column = worksheet.getColumn(index + 1);
    const labelLength = col.label.length;
    column.width = Math.max(12, Math.min(labelLength * 1.5, 40));
  });

  // オートフィルターを有効化
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  // サンプル行を追加
  if (includeSample) {
    const sampleRows = generateSampleRows(columns, 3);
    sampleRows.forEach((rowData) => {
      const row = worksheet.addRow(columns.map((col) => rowData[col.key] || ""));
      
      // サンプル行のスタイル
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = {
          vertical: "top",
          wrapText: true,
        };
      });
    });
  }

  // データ検証（enum列）は型定義の問題でスキップ
  // 将来的にはExcelJSの型定義が更新された際に有効化可能
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
 * Excelファイルをダウンロード
 */
export async function downloadExcel(
  testItemsColumns: ColumnDefinition[],
  evidenceLogColumns: ColumnDefinition[],
  options: {
    includeSample: boolean;
    profileName: string;
    level: "lite" | "full";
  }
): Promise<void> {
  const blob = await generateExcelFile(
    testItemsColumns,
    evidenceLogColumns,
    options
  );

  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const filename = `EvidenceTemplate_${options.profileName}_${options.level}_${today}.xlsx`;

  saveAs(blob, filename);
}
