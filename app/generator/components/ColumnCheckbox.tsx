"use client";

import { useState } from "react";
import type { ColumnDefinition } from "@/types";

type ColumnCheckboxProps = {
  columns: ColumnDefinition[];
  selectedKeys: Set<string>;
  onToggle: (key: string) => void;
  sheetName: "test_items" | "evidence_log";
};

export function ColumnCheckbox({
  columns,
  selectedKeys,
  onToggle,
  sheetName,
}: ColumnCheckboxProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["MUST", "RECOMMENDED"])
  );

  // カテゴリごとにグループ化
  const mustColumns = columns.filter((col) => col.category === "MUST");
  const recommendedColumns = columns.filter((col) => col.category === "RECOMMENDED");
  const optionalColumns = columns.filter((col) => col.category === "OPTIONAL");

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getCategoryStyle = (category: "MUST" | "RECOMMENDED" | "OPTIONAL") => {
    switch (category) {
      case "MUST":
        return "bg-blue-500/10 border-blue-500/30";
      case "RECOMMENDED":
        return "bg-amber-500/10 border-amber-500/30";
      case "OPTIONAL":
        return "bg-gray-500/10 border-gray-500/30";
    }
  };

  const getCategoryLabel = (category: "MUST" | "RECOMMENDED" | "OPTIONAL") => {
    switch (category) {
      case "MUST":
        return "必須列（常に選択）";
      case "RECOMMENDED":
        return "推奨列";
      case "OPTIONAL":
        return "任意列";
    }
  };

  const renderCategorySection = (
    category: "MUST" | "RECOMMENDED" | "OPTIONAL",
    categoryColumns: ColumnDefinition[]
  ) => {
    if (categoryColumns.length === 0) return null;

    const isExpanded = expandedCategories.has(category);
    const selectedCount = categoryColumns.filter((col) =>
      selectedKeys.has(col.key)
    ).length;

    return (
      <div
        key={category}
        className={`border rounded-lg overflow-hidden ${getCategoryStyle(category)}`}
      >
        {/* カテゴリヘッダー */}
        <button
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{getCategoryLabel(category)}</span>
            <span className="text-sm text-foreground/60">
              ({selectedCount} / {categoryColumns.length})
            </span>
          </div>
          <span className="text-foreground/60">
            {isExpanded ? "▼" : "▶"}
          </span>
        </button>

        {/* 列リスト */}
        {isExpanded && (
          <div className="border-t border-border/30 p-3 space-y-2">
            {categoryColumns.map((col) => {
              const isChecked = selectedKeys.has(col.key);
              const isMust = col.category === "MUST";

              return (
                <label
                  key={col.key}
                  className={`flex items-start gap-3 p-2 rounded hover:bg-white/5 transition-colors ${
                    isMust ? "opacity-75" : "cursor-pointer"
                  }`}
                  title={isMust ? "必須列は常に選択されます" : undefined}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isMust}
                    onChange={() => !isMust && onToggle(col.key)}
                    className="checkbox-base mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{col.label}</div>
                    {col.help && (
                      <div className="text-xs text-foreground/60 mt-1">
                        {col.help}
                      </div>
                    )}
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/70">
                        {col.type}
                      </span>
                      {col.enum && (
                        <span className="text-xs text-foreground/60">
                          選択肢: {col.enum.join(", ")}
                        </span>
                      )}
                      {col.sap_hint && (
                        <span className="text-xs text-primary/80">
                          SAP関連
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const sheetLabel = sheetName === "test_items" ? "テスト項目表" : "証跡ログ";

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4">
        {sheetLabel}の列選択
        <span className="ml-2 text-sm font-normal text-foreground/60">
          ({selectedKeys.size} 列選択中)
        </span>
      </h3>

      <div className="space-y-3">
        {renderCategorySection("MUST", mustColumns)}
        {renderCategorySection("RECOMMENDED", recommendedColumns)}
        {renderCategorySection("OPTIONAL", optionalColumns)}
      </div>
    </div>
  );
}
