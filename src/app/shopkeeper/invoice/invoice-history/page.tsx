"use client";

import React from "react";
import { useMyInvoiceHistory } from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Eye, FileText, Calendar, Store, Phone } from "lucide-react";

// Invoice Item matching the API response structure
interface InvoiceItem {
  _id: string;
  invoice: {
    public_id: string;
    url: string;
    resource_type: string;
  };
  shopkeeperId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    shopName: string;
    phone: string;
  };
  type: string;
  createdAt: string;
  updatedAt: string;
}

const InvoiceHistoryPage = () => {
  const session = useSession();
  const id = session.data?.user?.id;

  // Fetching data using your custom hook
  const {
    data: response,
    isLoading,
    isError,
  } = useMyInvoiceHistory(id as string);

  // Safely extract the data array from backend response envelope
  const invoices: InvoiceItem[] = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-3 font-medium text-muted-foreground">
          Loading invoice history...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 font-medium">
        Failed to load invoice history. Please try again later.
      </div>
    );
  }

  // Helper to handle force download via dynamic anchor trigger
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = filename;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  return (
    <div className="p-4 md:p-8  space-y-6">
      {/* Page Header section matching layout weight */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Invoice Registry
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          View and manage all system-generated and custom distribution receipts.
        </p>
      </div>

      <Card className="rounded-[28px] border p-0 border-border bg-card overflow-hidden shadow-sm">
        <CardHeader className="bg-surface border-b border-border/60 py-5 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold">
                Billing History
              </CardTitle>
            </div>
            <span className="text-xs font-black text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-full uppercase tracking-wider">
              Total Records: {invoices.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface ">
                <TableRow className="hover:bg-transparent">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Invoice ID
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Merchant / Shop
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Classification
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Generation Date
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">
                    Actions
                  </th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <td
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground font-medium"
                    >
                      No invoices recorded in this account history.
                    </td>
                  </TableRow>
                ) : (
                  invoices.map((item) => {
                    const shopkeeper = item.shopkeeperId;
                    const formattedDate = new Date(
                      item.createdAt,
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <TableRow
                        key={item._id}
                        className="transition-all hover:bg-slate-50/40 group border-b border-border/50"
                      >
                        {/* Column 1: DB ID representation */}
                        <TableCell className="px-6 py-5 font-bold text-slate-600 font-mono text-xs">
                          #INV-{item._id.slice(-8).toUpperCase()}
                        </TableCell>

                        {/* Column 2: Profile info derived from populating shopkeeperId */}
                        <TableCell className="px-6 py-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-black text-foreground flex items-center gap-1.5 text-sm">
                              <Store className="w-3.5 h-3.5 text-sky-500" />
                              {shopkeeper?.shopName || "Unknown Merchant"}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              {shopkeeper?.phone || "N/A"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Column 3: Type category logic */}
                        <TableCell className="px-6 py-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                            {item.type}
                          </span>
                        </TableCell>

                        {/* Column 4: Processed ISO Timestamp */}
                        <TableCell className="px-6 py-5 text-muted-foreground font-bold text-sm">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formattedDate}
                          </span>
                        </TableCell>

                        {/* Column 5: Action anchors containing the View & Download components */}
                        <TableCell
                          className="px-6 py-5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            {/* View Button - Opens direct link inside native browser context */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 px-3 border  hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-foreground"
                              onClick={() =>
                                window.open(
                                  item.invoice.url,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Button>

                            {/* Download Action Component */}
                            <Button
                              size="sm"
                              className="h-9 px-3 bg-primary hover:bg-primary/90 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-primary-foreground"
                              onClick={async () =>
                                await handleDownload(
                                  item.invoice.url,
                                  `invoice_${item._id.slice(-6)}.pdf`,
                                )
                              }
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceHistoryPage;
