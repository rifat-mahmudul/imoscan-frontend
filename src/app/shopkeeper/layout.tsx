import Header from "@/components/shared/shopkeeper/Header";
import Sidebar from "@/components/shared/shopkeeper/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IMOSCAN | Shopkeeper",
  description: "Verify Global IMEI/EAN Intelligence in Real-Time",
  icons: {
    icon: "/images/logo.svg",
  },
};
export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
