import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Evidence Templates",
  description: "Downloadable templates for test cases and evidence logs"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
        margin: 0,
        background: "#0b1220",
        color: "#e6edf3"
      }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 60px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
