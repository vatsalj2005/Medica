import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Medica",
  description: "Medical Appointment Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#080e08] text-[#e8f5e8] antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
