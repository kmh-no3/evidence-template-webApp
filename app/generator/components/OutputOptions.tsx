"use client";

type OutputOptionsProps = {
  format: "xlsx" | "csv";
  includeSample: boolean;
  csvSheet: "test_items" | "evidence_log";
  onFormatChange: (format: "xlsx" | "csv") => void;
  onIncludeSampleChange: (includeSample: boolean) => void;
  onCsvSheetChange: (csvSheet: "test_items" | "evidence_log") => void;
};

export function OutputOptions({
  format,
  includeSample,
  csvSheet,
  onFormatChange,
  onIncludeSampleChange,
  onCsvSheetChange,
}: OutputOptionsProps) {
  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-bold text-foreground">出力オプション</h2>

      {/* フォーマット選択 */}
      <div>
        <label className="label-base block mb-2">出力形式</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="xlsx"
              checked={format === "xlsx"}
              onChange={(e) => onFormatChange(e.target.value as "xlsx")}
              className="w-4 h-4 text-primary bg-background border-border focus:ring-2 focus:ring-primary/50"
            />
            <div>
              <span className="font-medium">Excel (XLSX)</span>
              <span className="ml-2 text-sm text-foreground/70">
                2シート（テスト項目表＋証跡ログ）
              </span>
            </div>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="csv"
              checked={format === "csv"}
              onChange={(e) => onFormatChange(e.target.value as "csv")}
              className="w-4 h-4 text-primary bg-background border-border focus:ring-2 focus:ring-primary/50"
            />
            <div>
              <span className="font-medium">CSV</span>
              <span className="ml-2 text-sm text-foreground/70">
                1シートのみ出力
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* CSV時のシート選択 */}
      {format === "csv" && (
        <div>
          <label htmlFor="csv-sheet" className="label-base block mb-2">
            出力するシート
          </label>
          <select
            id="csv-sheet"
            value={csvSheet}
            onChange={(e) =>
              onCsvSheetChange(e.target.value as "test_items" | "evidence_log")
            }
            className="input-base w-full max-w-xs"
          >
            <option value="test_items">テスト項目表</option>
            <option value="evidence_log">証跡ログ</option>
          </select>
        </div>
      )}

      {/* サンプル行を含める */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeSample}
            onChange={(e) => onIncludeSampleChange(e.target.checked)}
            className="checkbox-base"
          />
          <div>
            <span className="font-medium">サンプル行を含める</span>
            <span className="ml-2 text-sm text-foreground/70">
              （3行のサンプルデータを生成）
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
