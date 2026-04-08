import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VentureNex — Build Teams, Launch Projects",
  description:
    "The AI-powered business directory that helps you plan projects, find the right people, and build teams — globally.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
