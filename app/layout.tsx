import type { Metadata } from "next";
import { KaptureBodyClass } from "../components/KaptureBodyClass";

export const metadata: Metadata = {
  title: "Code Genie Pro",
  description: "AI Multimodal Coding Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen antialiased">
        <KaptureBodyClass />
        {children}
      </body>
    </html>
  );
}

