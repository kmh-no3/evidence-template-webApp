"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Profile, ColumnDefinition, ColumnDefinitions } from "@/types";
import {
  loadColumnDefinitions,
  loadProfiles,
  getColumnsForProfile,
  getDefaultSelectedKeys,
  getSelectedColumns,
  splitColumnsBySheet,
} from "@/lib/utils/columnUtils";
import {
  loadPreferences,
  savePreferences,
  saveSelectedColumns,
} from "@/lib/storage/preferences";
import { downloadExcel } from "@/lib/generators/excelGenerator";
import { downloadCsv } from "@/lib/generators/csvGenerator";
import { ProfileSelector } from "./components/ProfileSelector";
import { ColumnCheckbox } from "./components/ColumnCheckbox";
import { OutputOptions } from "./components/OutputOptions";
import { GenerateButton } from "./components/GenerateButton";

export default function GeneratorPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColumnDefinitions | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<"lite" | "full">("lite");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");
  const [includeSample, setIncludeSample] = useState(true);
  const [csvSheet, setCsvSheet] = useState<"test_items" | "evidence_log">("test_items");
  const [isLoading, setIsLoading] = useState(true);

  // 初期ロード
  useEffect(() => {
    async function init() {
      try {
        const [loadedProfiles, loadedColumnDefs] = await Promise.all([
          loadProfiles(),
          loadColumnDefinitions(),
        ]);

        setProfiles(loadedProfiles);
        setColumnDefs(loadedColumnDefs);

        // LocalStorageから設定を復元
        const prefs = loadPreferences();
        if (prefs) {
          if (prefs.profile_id && loadedProfiles.find((p) => p.id === prefs.profile_id)) {
            setSelectedProfileId(prefs.profile_id);
          }
          if (prefs.level) {
            setSelectedLevel(prefs.level);
          }
          if (prefs.format) {
            setFormat(prefs.format);
          }
          if (prefs.include_sample !== undefined) {
            setIncludeSample(prefs.include_sample);
          }
          if (prefs.csv_sheet) {
            setCsvSheet(prefs.csv_sheet);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // プロファイル/レベル変更時にデフォルト列を設定
  useEffect(() => {
    if (!selectedProfileId || !columnDefs) return;

    const profile = profiles.find((p) => p.id === selectedProfileId);
    if (!profile) return;

    // LocalStorageから保存された選択を復元
    const prefs = loadPreferences();
    const savedKeys = prefs?.selected_columns?.[selectedProfileId]?.[selectedLevel];

    if (savedKeys) {
      setSelectedKeys(new Set(savedKeys));
    } else {
      // デフォルト選択を適用
      const defaultKeys = getDefaultSelectedKeys(profile, selectedLevel);
      
      // 必須列も追加
      const testItemsColumns = getColumnsForProfile(profile, columnDefs, "test_items");
      const evidenceColumns = getColumnsForProfile(profile, columnDefs, "evidence_log");
      const allColumns = [...testItemsColumns, ...evidenceColumns];
      const mustKeys = allColumns
        .filter((col) => col.category === "MUST")
        .map((col) => col.key);

      const combinedKeys = new Set([...defaultKeys, ...mustKeys]);
      setSelectedKeys(combinedKeys);
    }
  }, [selectedProfileId, selectedLevel, profiles, columnDefs]);

  // プロファイル変更
  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    savePreferences({
      ...loadPreferences(),
      profile_id: profileId,
    });
  };

  // レベル変更
  const handleLevelChange = (level: "lite" | "full") => {
    setSelectedLevel(level);
    savePreferences({
      ...loadPreferences(),
      level,
    });
  };

  // 列の選択/解除
  const handleColumnToggle = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      // LocalStorageに保存
      if (selectedProfileId) {
        saveSelectedColumns(selectedProfileId, selectedLevel, Array.from(next));
      }

      return next;
    });
  };

  // フォーマット変更
  const handleFormatChange = (newFormat: "xlsx" | "csv") => {
    setFormat(newFormat);
    savePreferences({
      ...loadPreferences(),
      format: newFormat,
    });
  };

  // サンプル行含む変更
  const handleIncludeSampleChange = (include: boolean) => {
    setIncludeSample(include);
    savePreferences({
      ...loadPreferences(),
      include_sample: include,
    });
  };

  // CSVシート変更
  const handleCsvSheetChange = (sheet: "test_items" | "evidence_log") => {
    setCsvSheet(sheet);
    savePreferences({
      ...loadPreferences(),
      csv_sheet: sheet,
    });
  };

  // テンプレート生成
  const handleGenerate = async () => {
    if (!selectedProfileId || !columnDefs) {
      throw new Error("プロファイルまたは列定義が読み込まれていません");
    }

    const profile = profiles.find((p) => p.id === selectedProfileId);
    if (!profile) {
      throw new Error("プロファイルが見つかりません");
    }

    // 選択された列を取得
    const selectedColumns = getSelectedColumns(Array.from(selectedKeys), columnDefs);
    const { test_items, evidence_log } = splitColumnsBySheet(selectedColumns);

    if (format === "xlsx") {
      // Excel生成
      await downloadExcel(test_items, evidence_log, {
        includeSample,
        profileName: profile.id,
        level: selectedLevel,
      });
    } else {
      // CSV生成
      const columns = csvSheet === "test_items" ? test_items : evidence_log;
      downloadCsv(columns, {
        includeSample,
        profileName: profile.id,
        level: selectedLevel,
        sheetName: csvSheet,
      });
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-foreground/70">読み込み中...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const profile = selectedProfileId
    ? profiles.find((p) => p.id === selectedProfileId)
    : null;

  const testItemsColumns = profile && columnDefs
    ? getColumnsForProfile(profile, columnDefs, "test_items")
    : [];

  const evidenceColumns = profile && columnDefs
    ? getColumnsForProfile(profile, columnDefs, "evidence_log")
    : [];

  return (
    <main className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="text-primary hover:text-primary-dark transition-colors"
            >
              ← トップに戻る
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">テンプレート生成</h1>
          <p className="text-foreground/80">
            プロファイルと列を選択して、プロジェクトに最適なエビデンステンプレートを生成します。
          </p>
        </header>

        {/* メインコンテンツ */}
        <div className="space-y-6">
          {/* プロファイル選択 */}
          <ProfileSelector
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            selectedLevel={selectedLevel}
            onProfileChange={handleProfileChange}
            onLevelChange={handleLevelChange}
          />

          {/* 列選択 */}
          {profile && (
            <>
              <ColumnCheckbox
                columns={testItemsColumns}
                selectedKeys={selectedKeys}
                onToggle={handleColumnToggle}
                sheetName="test_items"
              />

              <ColumnCheckbox
                columns={evidenceColumns}
                selectedKeys={selectedKeys}
                onToggle={handleColumnToggle}
                sheetName="evidence_log"
              />
            </>
          )}

          {/* 出力オプション */}
          <OutputOptions
            format={format}
            includeSample={includeSample}
            csvSheet={csvSheet}
            onFormatChange={handleFormatChange}
            onIncludeSampleChange={handleIncludeSampleChange}
            onCsvSheetChange={handleCsvSheetChange}
          />

          {/* 生成ボタン */}
          <GenerateButton
            disabled={!selectedProfileId || selectedKeys.size === 0}
            onGenerate={handleGenerate}
          />
        </div>
      </div>
    </main>
  );
}
