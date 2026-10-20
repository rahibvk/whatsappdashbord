import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "IndaureX — Multi-Tenant WhatsApp SaaS Platform",
  description:
    "Connect your Twilio WhatsApp Business account and start automating customer conversations at scale.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="noise-overlay">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
