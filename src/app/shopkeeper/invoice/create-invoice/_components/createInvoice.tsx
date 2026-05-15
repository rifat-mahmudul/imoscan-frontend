/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Store, User, Download, Package, Send } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import {
  useCreateInvoice,
  useMyInventory,
} from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useSession } from "next-auth/react";

// --- Enhanced PDF Styles (Professional Layout) ---
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontSize: 10,
    color: "#334155",
  },
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "#0d9488",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    alignItems: "center",
    borderBottom: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 20,
  },
  logo: {
    width: 120, // Adjust based on your logo aspect ratio
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "right",
  },
  infoContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 30,
    marginTop: 10,
  },
  infoBox: {
    flex: 1,
    border: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  infoLabel: {
    backgroundColor: "#f97316",
    color: "white",
    padding: 8,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoLabelBlue: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 8,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoContent: { padding: 12, lineHeight: 1.6 },
  customerName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },

  // Table Styles
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottom: 2,
    borderBottomColor: "#0d9488",
    color: "#475569",
    fontWeight: "bold",
    padding: 10,
    textTransform: "uppercase",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 10,
    alignItems: "center",
  },
  colProduct: {
    width: "55%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colId: { width: "20%", textAlign: "center" },
  colPrice: { width: "25%", textAlign: "right" },

  productImg: {
    width: 35,
    height: 35,
    borderRadius: 6,
    border: 1,
    borderColor: "#e2e8f0",
  },
  productText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
  },
  productSub: {
    fontSize: 7,
    color: "#64748b",
  },

  totalSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 15,
    borderRadius: 12,
    width: 220,
    textAlign: "right",
  },
  totalLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: 4,
  },
  totalAmount: { fontSize: 18, fontWeight: "bold" },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    borderTop: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 15,
  },
});

const InvoicePDF = ({ customer, items, total }: any) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.headerBar} />

      {/* Header with Logo */}
      <View style={pdfStyles.topSection}>
        <Image src="/images/logo.png" style={pdfStyles.logo} />
        <View>
          <Text style={pdfStyles.invoiceTitle}>INVOICE</Text>
          <Text style={{ fontSize: 8, color: "#64748b", textAlign: "right" }}>
            Date: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Info Boxes */}
      <View style={pdfStyles.infoContainer}>
        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.infoLabel}>Billed To</Text>
          <View style={pdfStyles.infoContent}>
            <Text style={pdfStyles.customerName}>
              {customer.name || "Valued Customer"}
            </Text>
            <Text>{customer.email || "N/A"}</Text>
            <Text>{customer.phone || "N/A"}</Text>
            <Text style={{ fontSize: 8, color: "#64748b", marginTop: 4 }}>
              {customer.address || "N/A"}
            </Text>
          </View>
        </View>
        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.infoLabelBlue}>Store Info</Text>
          <View style={pdfStyles.infoContent}>
            <Text style={pdfStyles.customerName}>GADGET GALAXY</Text>
            <Text>Bashundhara City, Dhaka</Text>
            <Text>shop@gadgetgalaxy.com</Text>
            <Text>+880 1234-567890</Text>
          </View>
        </View>
      </View>

      {/* Table */}
      <View style={pdfStyles.tableHeader}>
        <Text style={pdfStyles.colProduct}>Product Details</Text>
        <Text style={pdfStyles.colId}>Model ID</Text>
        <Text style={pdfStyles.colPrice}>Price</Text>
      </View>

      {items.map((item: any) => (
        <View key={item.id} style={pdfStyles.tableRow}>
          <View style={pdfStyles.colProduct}>
            <Image src={item.image} style={pdfStyles.productImg} />
            <View>
              <Text style={pdfStyles.productText}>{item.name}</Text>
              <Text style={pdfStyles.productSub}>
                Brand New • Local Warranty
              </Text>
            </View>
          </View>
          <Text style={pdfStyles.colId}>#DEV-{item.id}</Text>
          <Text style={pdfStyles.colPrice}>${item.price.toFixed(2)}</Text>
        </View>
      ))}

      {/* Total Section */}
      <View style={pdfStyles.totalSection}>
        <View style={pdfStyles.totalBox}>
          <Text style={pdfStyles.totalLabel}>Total Amount Due</Text>
          <Text style={pdfStyles.totalAmount}>${total.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={pdfStyles.footer}>
        This is a computer-generated invoice and requires no signature. Thank
        you for shopping at Gadget Galaxy!
      </Text>
    </Page>
  </Document>
);

export default function CreateInvoice() {
  const { data: inventoryData, isLoading, isError } = useMyInventory();
  const { mutate: createInvoice } = useCreateInvoice();
  const session = useSession();
  const shopkeeper = session.data?.user;
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    card: "",
    address: "",
  });

  const toggleDevice = (id: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const devices = useMemo(() => {
    return (
      inventoryData?.data?.map((item: any) => ({
        id: item._id,
        name: item.itemName,
        price: item.expectedPrice,
        image: item.image?.url || "/placeholder.png",
      })) || []
    );
  }, [inventoryData]);

  const selectedDevicesData = useMemo(
    () => devices.filter((device) => selectedDeviceIds.includes(device.id)),
    [devices, selectedDeviceIds],
  );

  const totalPrice = selectedDevicesData.reduce((sum, d) => sum + d.price, 0);

  const handleCreateInvoice = async () => {
    if (!selectedDevicesData.length) return;

    const doc = (
      <InvoicePDF
        customer={customer}
        items={selectedDevicesData}
        total={totalPrice}
      />
    );

    const blob = await pdf(doc).toBlob();

    const file = new File([blob], `invoice_${customer.name || "gadget"}.pdf`, {
      type: "application/pdf",
    });

    createInvoice({
      shopkeeperId: shopkeeper?.id || "223423423",
      type: "Custom invoice",
      invoice: file,
    });
  };

  return (
    <div className="px-4 py-8 md:px-8 lg:px-10 font-poppins min-h-screen bg-background">
      <div className="mx-auto space-y-8">
        {/* Header Content (Keeping your updated style) */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Invoice Generator
          </h1>
          <div className="hidden md:flex gap-4 items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Selected Items: {selectedDeviceIds.length}
            </span>
          </div>
        </div>

        {/* Input Cards (Your Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card border border-border rounded-[28px] p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <User size={20} />
              </div>
              <p className="text-xl font-black text-foreground">
                Customer Information
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Full Name
                </label>
                <Input
                  className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                  placeholder="Mehedi Hasan Shishir"
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Email Address
                </label>
                <Input
                  type="email"
                  className="rounded-2xl h-12 border-primary bg-background font-bold"
                  placeholder="shishir@example.com"
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Phone
                </label>
                <Input
                  type="number"
                  className="rounded-2xl h-12 border-primary bg-background font-bold"
                  placeholder="+880 1XXX XXXXXX"
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Billing Address
                </label>
                <Input
                  className="rounded-2xl h-12 border-primary bg-background font-bold"
                  placeholder="Dhaka, Bangladesh"
                  onChange={(e) =>
                    setCustomer({ ...customer, address: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Shop Card */}
          <div className="bg-[#1e293b] rounded-[28px] p-8 text-white flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-sky-400">
                <Store size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  GADGET GALAXY
                </h2>
                <p className="text-xs font-bold text-sky-400/80 uppercase tracking-widest">
                  Premium Merchant
                </p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Store Address
                </p>
                <p className="text-sm font-bold">Bashundhara City, Dhaka</p>
              </div>
            </div>
          </div>
        </div>

        {/* Device Table */}
        <div className="rounded-[32px] border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="border-b border-border bg-surface text-xs font-black uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-8 py-6 w-20">Select</th>
                <th className="px-8 py-6">Product Details</th>
                <th className="px-8 py-6 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {devices.map((device) => {
                const isSelected = selectedDeviceIds.includes(device.id);
                return (
                  <tr
                    key={device.id}
                    className={`group transition-all hover:bg-slate-50/50 cursor-pointer ${
                      isSelected ? "bg-orange-50/40" : ""
                    }`}
                    onClick={() => toggleDevice(device.id)}
                  >
                    {/* Checkbox column */}
                    <td
                      className="px-8 py-6"
                      onClick={(e) => e.stopPropagation()} // prevent double toggle
                    >
                      <Checkbox
                        className="h-6 w-6 rounded-lg border-primary focus:ring-primary"
                        checked={isSelected}
                        onCheckedChange={() => toggleDevice(device.id)}
                      />
                    </td>

                    {/* Device info */}
                    <td className="px-8 py-6 flex items-center gap-4">
                      <img
                        src={device.image}
                        className="w-12 h-12 rounded-2xl object-cover"
                        alt={device.name}
                      />
                      <div>
                        <p className="font-black text-foreground">
                          {device.name}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground">
                          #DEV-{device.id}
                        </p>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-8 py-6 text-right font-black text-lg">
                      ${device.price}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Bar with updated PDF Link */}
        <div className="sticky bottom-6 flex justify-between items-center bg-card border border-border p-6 rounded-[32px] shadow-2xl">
          <div className="flex items-center gap-6 px-4">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
              <Package size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Total Amount Due
              </p>
              <p className="text-3xl font-black text-foreground tracking-tighter">
                ${totalPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* {typeof window !== "undefined" && (
            <PDFDownloadLink
              document={
                <InvoicePDF
                  customer={customer}
                  items={selectedDevicesData}
                  total={totalPrice}
                />
              }
              fileName={`invoice_${customer.name || "gadget"}.pdf`}
            >
              {({ loading }) => (
                <Button
                  disabled={selectedDeviceIds.length === 0 || loading}
                  className="bg-primary hover:bg-primary/90 h-16 px-10 text-sm font-black rounded-full shadow-lg flex items-center gap-3 uppercase tracking-wider"
                >
                  {loading ? (
                    "Preparing PDF..."
                  ) : (
                    <>
                      <Download size={20} /> Generate Report
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
          )} */}
          <Button
            onClick={handleCreateInvoice}
            disabled={selectedDeviceIds.length === 0 || isLoading}
            className="bg-primary hover:bg-primary/90 h-16 px-10 text-sm font-black rounded-full shadow-lg flex items-center gap-3 uppercase tracking-wider"
          >
            {isLoading ? (
              "Uploading..."
            ) : (
              <>
                <Send size={20} /> Send Invoice
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
