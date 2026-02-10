"use client";

import { useState } from "react";

type GenerateButtonProps = {
  disabled: boolean;
  onGenerate: () => Promise<void>;
};

export function GenerateButton({ disabled, onGenerate }: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      await onGenerate();
    } catch (err) {
      console.error("Generation failed:", err);
      setError(
        err instanceof Error ? err.message : "テンプレートの生成に失敗しました"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col gap-4">
        <button
          onClick={handleClick}
          disabled={disabled || isGenerating}
          className={`btn btn-primary text-lg py-4 ${
            disabled || isGenerating
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-[1.02] active:scale-[0.98]"
          } transition-all duration-200`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              生成中...
            </span>
          ) : (
            "テンプレートを生成してダウンロード"
          )}
        </button>

        {disabled && !isGenerating && (
          <p className="text-sm text-amber-400/90 text-center">
            プロファイルを選択してください
          </p>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
