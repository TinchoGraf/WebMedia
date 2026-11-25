import type { Metadata } from "next";
export const metadata: Metadata = { title: { default: "Panel", template: "%s | Panel" }, robots: { index: false, follow: false } };
export default function PanelRaiz({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-piedra">{children}</div>;
}
