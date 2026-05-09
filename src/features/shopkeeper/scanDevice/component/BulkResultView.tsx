/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ArrowLeft,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Wallet,
  Lock,
  Cpu,
  Check,
  AlertTriangle,
  Gauge,
  Database,
  RadioTower,
} from "lucide-react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { CertificatePDF } from "./CertificatePDF";
import {
  BatchImeiResponse,
  BatchImeiItemResult,
} from "../../scanDevice/types/scanDevice.types";

interface BulkResultViewProps {
  batchResult: BatchImeiResponse | null;
  onClear: () => void;
  onBack: () => void;
  onDownloadCertificate: (
    elementIds: string[],
    filename: string,
  ) => Promise<void>;
  isDownloading: boolean;
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "clean":
      return "bg-[#84CC16] shadow-lime-500/20";
    case "warning":
      return "bg-orange-500 shadow-orange-500/20";
    default:
      return "bg-[#3B82F6] shadow-blue-500/20";
  }
};

// Helper function to get risk color class
const getRiskColorClass = (score: number) => {
  if (score <= 25) return "text-emerald-400 bg-emerald-500/10";
  if (score <= 60) return "text-amber-400 bg-amber-500/10";
  return "text-red-400 bg-red-500/10";
};

// Helper function to get check icon
const getCheckIcon = (title?: string) => {
  switch (title) {
    case "Global Blacklist":
      return ShieldCheck;
    case "Carrier Financing":
      return Wallet;
    case "Hardware Lock":
      return Lock;
    case "Part Authenticity":
      return Cpu;
    default:
      return ShieldCheck;
  }
};

// Helper function to get checks array
const getChecksArray = (result: any) => {
  if (!result?.checks) return [];
  if (typeof result.checks === "object" && !Array.isArray(result.checks)) {
    return Object.values(result.checks);
  }
  return Array.isArray(result.checks) ? result.checks : [];
};

export const BulkResultView = ({
  batchResult,
  onClear,
  onDownloadCertificate,
  isDownloading,
  onBack,
}: BulkResultViewProps) => {
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const batchRows = useMemo(() => batchResult?.data ?? [], [batchResult]);
  const successfulBatchRows = useMemo(
    () =>
      batchRows.filter(
        (
          row,
        ): row is BatchImeiItemResult & {
          data: NonNullable<typeof row.data>;
        } => Boolean(row.ok && row.data),
      ),
    [batchRows],
  );
  const selectedBatchRow = useMemo(
    () => batchRows[selectedBatchIndex] ?? null,
    [batchRows, selectedBatchIndex],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectedBatchIndexChange = useCallback((value: number) => {
    setSelectedBatchIndex(value);
    setIsSelectOpen(false);
  }, []);

  const handlePrevClick = useCallback(() => {
    setSelectedBatchIndex((current) => Math.max(current - 1, 0));
  }, []);

  const handleNextClick = useCallback(() => {
    setSelectedBatchIndex((current) =>
      Math.min(current + 1, batchRows.length - 1),
    );
  }, [batchRows.length]);

  const handleDownloadSelectedBulkCertificate = useCallback(() => {
    if (!selectedBatchRow?.ok || !selectedBatchRow.data) return;
    onDownloadCertificate(
      [`certificate-pdf-bulk-${selectedBatchIndex}`],
      `Certificate_${selectedBatchRow.imei}.pdf`,
    );
  }, [onDownloadCertificate, selectedBatchIndex, selectedBatchRow]);

  const handleDownloadAllBulkCertificates = useCallback(() => {
    if (successfulBatchRows.length === 0) return;
    onDownloadCertificate(
      successfulBatchRows.map(
        (_, index) => `certificate-pdf-bulk-success-${index}`,
      ),
      `Bulk_IMEI_Certificates_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  }, [onDownloadCertificate, successfulBatchRows]);

  if (!batchResult) return null;

  const currentData = selectedBatchRow?.data;
  const checksArray = currentData ? getChecksArray(currentData) : [];
  const riskScore = currentData?.riskMeter?.score || 0;
  const riskColorClass = getRiskColorClass(riskScore);

  return (
    <div className="w-full space-y-6 pb-10 font-poppins">
      {/* Back Button */}
      <button
        onClick={() => {
          console.log("Back button clicked");
          onBack();
        }}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] font-bold transition group cursor-pointer"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Scan another device
      </button>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-gray-100 bg-white p-6 md:p-8 shadow-sm"
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#84CC16]">
              Reports
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-black text-[#0F172A]">
              Bulk IMEI Scan Results
            </h2>
            <p className="mt-2 text-sm font-medium text-[#64748B] max-w-2xl">
              Results are rendered directly on this page and organized one at a
              time for easier review.
            </p>
          </div>

          <button
            onClick={() => {
              console.log("Clear button clicked");
              onClear();
            }}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-black text-[#64748B] transition hover:bg-gray-50 hover:text-[#0F172A]"
          >
            Clear Results
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-slate-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Total
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900">
              {batchResult.summary.total}
            </p>
          </div>
          <div className="rounded-2xl border border-lime-100 bg-lime-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-lime-600" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-lime-700">
                Success
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-lime-700">
              {batchResult.summary.successCount}
            </p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-red-600">
                Failed
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-red-600">
              {batchResult.summary.failedCount}
            </p>
          </div>
        </div>

        {/* Download All Button */}
        {successfulBatchRows.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDownloadAllBulkCertificates}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-5 py-3 text-sm font-black text-white transition hover:bg-[#76b813] disabled:cursor-wait disabled:opacity-70"
            >
              {isDownloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Download All Certificates ({successfulBatchRows.length})
            </button>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="mt-6 rounded-[28px] border border-gray-100 bg-[#F8FAFC] p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">
                Navigate Results
              </h3>
              <p className="mt-2 text-sm font-semibold text-[#64748B]">
                Use the selector or next and previous controls to inspect each
                IMEI report.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              {/* Custom Dropdown */}
              <div className="relative" ref={selectRef}>
                <button
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="w-full min-w-[260px] flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:border-slate-300 transition-all"
                >
                  <span className="truncate">
                    {selectedBatchRow
                      ? `Row ${selectedBatchRow.rowNumber} - ${selectedBatchRow.imei} ${!selectedBatchRow.ok ? "(Failed)" : ""}`
                      : "Select a result"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isSelectOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isSelectOpen && (
                  <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {batchRows.map((row, index) => (
                      <button
                        key={`${row.rowNumber}-${row.imei}-${index}`}
                        onClick={() => handleSelectedBatchIndexChange(index)}
                        className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-slate-50 ${
                          selectedBatchIndex === index
                            ? "bg-[#84CC16]/10 text-[#84CC16]"
                            : "text-slate-700"
                        }`}
                      >
                        {`Row ${row.rowNumber} - ${row.imei} ${!row.ok ? "(Failed)" : ""}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handlePrevClick}
                disabled={selectedBatchIndex === 0}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <button
                onClick={handleNextClick}
                disabled={selectedBatchIndex === batchRows.length - 1}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected Result Details Card - New Design */}
      {selectedBatchRow?.ok && selectedBatchRow.data ? (
        <motion.div
          key={selectedBatchIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm"
        >
          {/* Download Button */}
          <div className="flex justify-end p-6 pb-0">
            <button
              onClick={handleDownloadSelectedBulkCertificate}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-black text-[#0F172A] transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-70 mb-5"
            >
              {isDownloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Download Certificate
            </button>
          </div>

          {/* Header Section */}
          <div className="p-6 pt-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#84CC16]/10 flex items-center justify-center">
                  <Smartphone size={28} className="text-[#84CC16]" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-1">
                    {selectedBatchRow.data.deviceName || "Unknown Device"}
                  </h1>
                  <p className="text-[#64748B] font-mono text-sm font-semibold">
                    IMEI: {selectedBatchRow.data.imei}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-4 py-2 text-white text-xs font-black rounded-full uppercase tracking-wider shadow-lg ${getStatusColor(
                    selectedBatchRow.data.deviceStatus || "",
                  )}`}
                >
                  {selectedBatchRow.data.deviceStatus || "Unknown"}
                </span>
                {selectedBatchRow.provider && (
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {selectedBatchRow.provider}
                  </span>
                )}
              </div>
            </div>

            {/* Risk Meter & Market Value */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">
                    Risk Meter
                  </span>
                  <span
                    className={`text-xs font-black ${riskColorClass} px-2 py-1 rounded-full`}
                  >
                    {riskScore}/100
                  </span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-1000"
                    style={{ width: `${riskScore}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-gray-400" />
                  <p className="text-sm font-bold text-[#0F172A]">
                    {selectedBatchRow.data.riskMeter?.label || "Risk Unknown"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider mb-1">
                  Market Value
                </p>
                <p className="text-3xl font-black text-[#0F172A]">
                  $
                  {selectedBatchRow.data.marketValue?.amount?.toFixed(2) ||
                    "0.00"}
                  <span className="text-sm font-medium text-gray-400 ml-1">
                    {selectedBatchRow.data.marketValue?.currency || "USD"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="mx-6 mb-6 p-5 bg-gradient-to-r from-[#F8FAFC] to-white rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#84CC16]/10 rounded-lg">
                <Sparkles size={14} className="text-[#84CC16]" />
              </div>
              <span className="text-[10px] font-black text-[#84CC16] uppercase tracking-wider">
                {selectedBatchRow.data.aiInsight?.title || "AI INSIGHT"}
              </span>
            </div>
            <p className="text-sm text-gray-600 italic leading-relaxed">
              &quot;
              {selectedBatchRow.data.aiInsight?.message ||
                "No insight available"}
              &quot;
            </p>
          </div>

          {/* Checks Grid */}
          <div className="px-6 pb-6">
            <h3 className="text-sm font-black text-[#0F172A] mb-4">
              Security Checks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checksArray.map((check: any, idx: number) => {
                const Icon = getCheckIcon(check?.title);
                const statusClass =
                  check.status === "passed"
                    ? "bg-emerald-50 text-emerald-500"
                    : check.status === "warning"
                      ? "bg-amber-50 text-amber-500"
                      : "bg-red-50 text-red-500";
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${statusClass}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-700">
                          {check?.title || "Check"}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 max-w-[200px]">
                          {check?.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        check.status === "passed"
                          ? "bg-emerald-500 text-white"
                          : check.status === "warning"
                            ? "bg-amber-500 text-white"
                            : "bg-red-500 text-white"
                      }`}
                    >
                      {check.status === "passed" ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <AlertTriangle size={14} strokeWidth={3} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="p-6 bg-gray-50/50 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block mb-1 text-[10px] font-black uppercase tracking-wider">
                  Provider
                </span>
                <span className="font-bold text-gray-700 text-sm">
                  {selectedBatchRow.provider || "API"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1 text-[10px] font-black uppercase tracking-wider">
                  Service ID
                </span>
                <span className="font-bold text-gray-700 text-sm">
                  {selectedBatchRow.serviceId ?? "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1 text-[10px] font-black uppercase tracking-wider">
                  Row Number
                </span>
                <span className="font-bold text-gray-700 text-sm">
                  {selectedBatchRow.rowNumber} / {batchRows.length}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1 text-[10px] font-black uppercase tracking-wider">
                  Status
                </span>
                <span
                  className={`font-bold text-sm ${selectedBatchRow.ok ? "text-emerald-600" : "text-red-600"}`}
                >
                  {selectedBatchRow.ok ? "Success" : "Failed"}
                </span>
              </div>
            </div>
            {selectedBatchRow.message && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[11px] text-gray-500">
                  <span className="font-black">Message:</span>{" "}
                  {selectedBatchRow.message}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      ) : selectedBatchRow ? (
        <motion.div
          key={selectedBatchIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-red-100 bg-red-50 p-8 shadow-sm"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">
            Failed Result
          </p>
          <h3 className="mt-2 text-2xl font-black text-red-700">
            Row {selectedBatchRow.rowNumber} could not be processed
          </h3>
          <p className="mt-3 text-sm font-semibold text-red-600">
            {selectedBatchRow.message}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                Row
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {selectedBatchRow.rowNumber}
              </p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                IMEI
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900 break-all">
                {selectedBatchRow.imei}
              </p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-white px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-400">
                Service ID
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {selectedBatchRow.serviceId ?? "N/A"}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Hidden Certificate Containers */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: "1100px",
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        {successfulBatchRows.map((row, index) => (
          <CertificatePDF
            key={`bulk-certificate-${row.rowNumber}-${row.imei}-${index}`}
            data={row.data}
            id={`certificate-pdf-bulk-success-${index}`}
            providerName={row.provider}
            serviceId={row.serviceId}
          />
        ))}
        {selectedBatchRow?.ok && selectedBatchRow.data && (
          <CertificatePDF
            key={`selected-bulk-certificate-${selectedBatchIndex}`}
            data={selectedBatchRow.data}
            id={`certificate-pdf-bulk-${selectedBatchIndex}`}
            providerName={selectedBatchRow.provider}
            serviceId={selectedBatchRow.serviceId}
          />
        )}
      </div>
    </div>
  );
};
