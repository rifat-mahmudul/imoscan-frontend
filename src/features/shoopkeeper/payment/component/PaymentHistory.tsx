"use client";

import React from "react";
import {
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Filter,
  X,
  CreditCard,
  Calendar,
  Hash,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const paymentData = [
  {
    id: "#INV-8858",
    amount: "$1,650.00",
    status: "PAID",
    created: "Nov 05, 2023",
    order: "App Development",
    method: "Mastercard •••• 4242",
    description: "Full development service for mobile application",
  },
  {
    id: "#INV-8842",
    amount: "$1,200.00",
    status: "PAID",
    created: "Oct 12, 2023",
    order: "IMEI Check Credits",
    method: "Visa •••• 5555",
    description: "Bulk purchase of 500 IMEI check credits",
  },
  {
    id: "#INV-8843",
    amount: "$2,500.00",
    status: "PENDING",
    created: "Oct 15, 2023",
    order: "Device Repair Services",
    method: "Bank Transfer",
    description: "Motherboard replacement and screen repair",
  },
  {
    id: "#INV-8844",
    amount: "$750.00",
    status: "PAID",
    created: "Oct 10, 2023",
    order: "Software License Renewal",
    method: "PayPal",
    description: "Annual subscription renewal for diagnostic tool",
  },
  {
    id: "#INV-8845",
    amount: "$3,000.00",
    status: "OVERDUE",
    created: "Sep 30, 2023",
    order: "Annual Maintenance Fee",
    method: "American Express",
    description: "System maintenance and security updates",
  },
  {
    id: "#INV-8846",
    amount: "$1,500.00",
    status: "PAID",
    created: "Oct 18, 2023",
    order: "Cloud Storage Subscription",
    method: "Visa •••• 1234",
    description: "Monthly cloud backup and storage fee",
  },
  {
    id: "#INV-8847",
    amount: "$980.00",
    status: "PENDING",
    created: "Oct 20, 2023",
    order: "Consultation Services",
    method: "Bank Transfer",
    description: "Technical architecture consultation",
  },
  {
    id: "#INV-8848",
    amount: "$400.00",
    status: "PAID",
    created: "Oct 14, 2023",
    order: "Website Hosting",
    method: "Mastercard •••• 8888",
    description: "Premium dedicated hosting service",
  },
  {
    id: "#INV-8849",
    amount: "$2,200.00",
    status: "OVERDUE",
    created: "Sep 29, 2023",
    order: "Product Development",
    method: "Visa •••• 9999",
    description: "New feature implementation and testing",
  },
  {
    id: "#INV-8850",
    amount: "$675.00",
    status: "PAID",
    created: "Oct 21, 2023",
    order: "IT Support Services",
    method: "PayPal",
    description: "Emergency technical support session",
  },
];

export default function PaymentHistory() {
  const [selectedPayment, setSelectedPayment] = React.useState<
    (typeof paymentData)[0] | null
  >(null);

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-8 font-poppins relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            Payment History
          </h1>
          <p className="text-[#64748B] font-medium mt-1">
            Track your payment status and invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#84CC16] transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search invoices..."
              className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold w-full md:w-[300px] shadow-sm"
            />
          </div>
          <button className="p-3.5 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition shadow-sm group">
            <Filter
              size={18}
              className="text-[#64748B] group-hover:text-[#0F172A]"
            />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-[#FBFDFB]">
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                  Transaction ID
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                  Amount
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                  Status
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                  Created
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                  Order
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paymentData.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-[#F8FAFC]/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-[#3B82F6] cursor-pointer hover:underline">
                      {row.id}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-[#0F172A]">
                      {row.amount}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${
                        row.status === "PAID"
                          ? "bg-[#DCFCE7] text-[#166534] ring-1 ring-[#84CC16]/20"
                          : row.status === "PENDING"
                            ? "bg-[#FEF9C3] text-[#854D0E] ring-1 ring-yellow-500/20"
                            : "bg-[#FEE2E2] text-[#991B1B] ring-1 ring-red-500/20"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[#64748B]">
                    {row.created}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[#475569]">
                    {row.order}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSelectedPayment(row)}
                        className="px-5 py-2.5 bg-[#84CC16] text-white text-[11px] font-black rounded-xl hover:bg-[#76b813] hover:scale-105 transition-all shadow-lg shadow-lime-500/20 active:scale-95 flex items-center gap-2 uppercase tracking-widest cursor-pointer"
                      >
                        <Eye size={14} strokeWidth={3} />
                        View
                      </button>
                      <button className="px-5 py-2.5 bg-white border-2 border-gray-100 text-[#64748B] text-[11px] font-black rounded-xl hover:border-[#84CC16] hover:text-[#84CC16] hover:bg-[#84CC16]/5 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest cursor-pointer">
                        <Download size={14} strokeWidth={3} />
                        Download PDF
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-8 py-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FBFDFB]/50">
          <p className="text-sm font-bold text-[#64748B]">
            Showing <span className="text-[#0F172A] font-black">1 - 10</span> of{" "}
            <span className="text-[#0F172A] font-black">58</span> results
          </p>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-[#64748B] hover:text-[#84CC16] hover:border-[#84CC16] transition-all disabled:opacity-50 shadow-sm active:scale-90">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1.5 px-1">
              {[1, 2, 3, "...", 6].map((page, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all shadow-sm active:scale-90 ${
                    page === 2
                      ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/20"
                      : page === "..."
                        ? "bg-transparent text-gray-400 cursor-default shadow-none"
                        : "bg-white border border-gray-100 text-[#64748B] hover:text-[#0F172A] hover:border-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#84CC16]/10 border border-[#84CC16]/20 text-[#84CC16] hover:bg-[#84CC16] hover:text-white transition-all shadow-sm active:scale-90">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPayment(null)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white"
            >
              {/* Modal Header */}
              <div className="p-8 pb-0 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#84CC16]/10 rounded-2xl flex items-center justify-center text-[#84CC16]">
                    <CreditCard size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                      Transaction Details
                    </h2>
                    <p className="text-[13px] font-bold text-[#64748B]">
                      View full breakdown of your invoice
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition text-[#94A3B8] hover:text-[#0F172A]"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-[#94A3B8]">
                      <Hash size={14} />
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        Transaction ID
                      </span>
                    </div>
                    <p className="text-[15px] font-black text-[#0F172A]">
                      {selectedPayment.id}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-[#94A3B8]">
                      <Calendar size={14} />
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        Date Created
                      </span>
                    </div>
                    <p className="text-[15px] font-black text-[#0F172A]">
                      {selectedPayment.created}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] px-1">
                    Payment Information
                  </h3>
                  <div className="divide-y divide-gray-100 border-y border-gray-100">
                    <div className="py-4 flex justify-between items-center">
                      <span className="text-sm font-bold text-[#64748B]">
                        Total Amount
                      </span>
                      <span className="text-lg font-black text-[#0F172A]">
                        {selectedPayment.amount}
                      </span>
                    </div>
                    <div className="py-4 flex justify-between items-center">
                      <span className="text-sm font-bold text-[#64748B]">
                        Status
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedPayment.status === "PAID" ? (
                          <CheckCircle size={14} className="text-[#84CC16]" />
                        ) : selectedPayment.status === "PENDING" ? (
                          <Clock size={14} className="text-yellow-500" />
                        ) : (
                          <AlertCircle size={14} className="text-red-500" />
                        )}
                        <span
                          className={`text-sm font-black ${selectedPayment.status === "PAID" ? "text-[#84CC16]" : selectedPayment.status === "PENDING" ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {selectedPayment.status}
                        </span>
                      </div>
                    </div>
                    <div className="py-4 flex justify-between items-center">
                      <span className="text-sm font-bold text-[#64748B]">
                        Payment Method
                      </span>
                      <span className="text-sm font-black text-[#0F172A]">
                        {selectedPayment.method}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] px-1">
                    Order Details
                  </h3>
                  <div className="p-5 bg-[#F8FAFC] rounded-3xl border border-gray-100 space-y-2">
                    <p className="text-sm font-black text-[#0F172A]">
                      {selectedPayment.order}
                    </p>
                    <p className="text-sm font-medium text-[#64748B] leading-relaxed italic">
                      {selectedPayment.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 pt-0 flex gap-3">
                <button className="flex-1 py-4 bg-[#84CC16] text-white font-black text-[13px] rounded-2xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest">
                  <Download size={16} strokeWidth={3} />
                  Download Invoice
                </button>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-8 py-4 bg-gray-100 text-[#64748B] font-black text-[13px] rounded-2xl hover:bg-gray-200 transition active:scale-95 uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
