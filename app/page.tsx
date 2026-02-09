import fs from "node:fs/promises";
import path from "node:path";

type Template = {
  id: string;
  name: string;
  file: string;
  format: "xlsx" | "csv";
  description: string;
  updated_at: string;
  sha256: string;
};

type Manifest = {
  manifest_version: number;
  templates_version: string;
  generated_at: string;
  templates: Template[];
};

async function loadManifest(): Promise<Manifest> {
  const p = path.join(process.cwd(), "public", "templates", "manifest.json");
  const raw = await fs.readFile(p, "utf-8");
  return JSON.parse(raw) as Manifest;
}

export default async function Page() {
  const manifest = await loadManifest();

  const groups = {
    "Excel（そのまま業務で使う）": manifest.templates.filter(t => t.format === "xlsx"),
    "CSV（ツール連携/取り込み用）": manifest.templates.filter(t => t.format === "csv"),
  };

  return (
    <main>
      <header style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 0.2 }}>テストエビデンス テンプレート</h1>
          <span style={{ opacity: 0.8 }}>v{manifest.templates_version}</span>
        </div>
        <p style={{ marginTop: 10, lineHeight: 1.7, opacity: 0.9 }}>
          SAP導入プロジェクトを含む各種案件で再利用できる、テスト項目表／証跡一覧テンプレートを配布するための最小Webアプリ（v0）。
          <br />
          テンプレートは <code style={{ padding: "2px 6px", background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>/public/templates</code> に配置されています。
        </p>
      </header>

      <section style={{ display: "grid", gap: 14 }}>
        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName} style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            padding: 16
          }}>
            <h2 style={{ margin: 0, fontSize: 16, opacity: 0.95 }}>{groupName}</h2>
            <div style={{ height: 10 }} />
            <div style={{ display: "grid", gap: 10 }}>
              {items.map((t) => (
                <div key={t.id} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.20)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.name}</div>
                    <div style={{ marginTop: 6, lineHeight: 1.6, opacity: 0.88 }}>{t.description}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap", opacity: 0.75, fontSize: 12 }}>
                      <span>更新日: {t.updated_at}</span>
                      <span>SHA-256: <code style={{ padding: "1px 6px", background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>{t.sha256.slice(0, 16)}…</code></span>
                      <a href="/api/templates" style={{ color: "#9dd1ff" }}>API</a>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <a
                      href={`/templates/${t.file}`}
                      style={{
                        display: "inline-block",
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "rgba(157, 209, 255, 0.16)",
                        border: "1px solid rgba(157, 209, 255, 0.35)",
                        color: "#e6edf3",
                        textDecoration: "none",
                        fontWeight: 700
                      }}
                    >
                      ダウンロード
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 22, opacity: 0.9, lineHeight: 1.7 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>更新方法（v0）</h2>
        <ol style={{ marginTop: 0 }}>
          <li><code>public/templates</code> に新しいテンプレートファイルを配置</li>
          <li><code>public/templates/manifest.json</code> の更新（version/sha256）</li>
          <li>GitHubへPush → Vercel等へデプロイ</li>
        </ol>
      </section>
    </main>
  );
}
