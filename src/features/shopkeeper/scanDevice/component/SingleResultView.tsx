"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  ShieldCheck,
  Wallet,
  Lock,
  Cpu,
  FileText,
  Download,
  Loader2,
  Check,
  AlertTriangle,
  Smartphone,
  Sparkles,
  Gauge,
  Database,
  RadioTower,
  Tag,
  Shield,
  Globe,
} from "lucide-react";
import { IMEIResult } from "../../scanDevice/types/scanDevice.types";
import { CertificatePDF } from "./CertificatePDF";
import {
  getChecksArray,
  getStatusColor,
  getTechnicalBreakdownItems,
} from "@/utils/resultHelpers";

interface SingleResultViewProps {
  scanResult: IMEIResult;
  singleReportMeta: { provider?: string; serviceId?: number } | null;
  selectedService?: { name?: string; serviceId?: number | null } | null;
  onBack: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

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

const getRiskColor = (score: number) => {
  if (score <= 25)
    return {
      stroke: "#22c55e",
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
    };
  if (score <= 60)
    return { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10" };
  return { stroke: "#ef4444", text: "text-red-400", bg: "bg-red-500/10" };
};

// Risk Arc Component
function RiskArc({ score }: { score: number }) {
  const r = 42;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(score, 100));
  const arcLength = (270 / 360) * circumference;
  const filledLength = (progress / 100) * arcLength;
  const { stroke, text } = getRiskColor(score);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 112, height: 112 }}
    >
      <svg width={112} height={112} style={{ transform: "rotate(135deg)" }}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={8}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={8}
          strokeDasharray={`${filledLength} ${circumference}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`text-2xl font-black tabular-nums ${text}`}>{score}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-0.5">
          /100
        </p>
      </div>
    </div>
  );
}

export const SingleResultView = ({
  scanResult,
  singleReportMeta,
  selectedService,
  onBack,
  onDownload,
  isDownloading,
}: SingleResultViewProps) => {
  const checksArray = getChecksArray(scanResult);
  const technicalItems = getTechnicalBreakdownItems(scanResult);
  const riskScore = scanResult.riskMeter?.score || 0;
  const riskColor = getRiskColor(riskScore);
  const statusTone = getStatusColor(scanResult.deviceStatus || "");

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8 font-poppins">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] font-bold transition group cursor-pointer"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Scan another device
      </button>

      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[32px] overflow-hidden shadow-xl"
      >
        {/* Header Content */}
        <div className="relative px-6 py-8 md:px-8 md:py-10">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#84CC16]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            {/* Left: Title block */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#84CC16]/20">
                  <Sparkles size={11} className="text-[#84CC16]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#84CC16]">
                  REPORT
                </p>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#84CC16]/15 border border-[#84CC16]/30">
                  <Smartphone size={22} className="text-[#84CC16]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-black text-white md:text-3xl">
                    {scanResult.deviceName || "Unknown Device"}
                  </h2>
                  <p className="mt-1 font-mono text-xs font-semibold text-white/40 tracking-widest">
                    IMEI: {scanResult.imei}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white ${statusTone}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {scanResult.deviceStatus || "Unknown"}
                </span>
                {singleReportMeta?.provider && (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/50">
                    {singleReportMeta.provider}
                  </span>
                )}
              </div>
            </div>

            {/* Right: AI Insight + Risk Arc */}
            <div className="flex items-center gap-6 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
              <RiskArc score={riskScore} />
              <div className="max-w-[200px]">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles size={12} className="text-[#84CC16]" />
                  <span className="text-[9px] font-black text-[#84CC16] uppercase tracking-wider">
                    {scanResult.aiInsight?.title || "AI INSIGHT"}
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  {scanResult.aiInsight?.message || "No insight available"}
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              {
                label: "Device Status",
                value: scanResult.deviceStatus || "Unknown",
                icon: Shield,
              },
              {
                label: "Risk Level",
                value: scanResult.riskMeter?.label || "Unknown",
                icon: Gauge,
                accent: riskColor.text,
              },
              {
                label: "Market Value",
                value: `$${scanResult.marketValue?.amount?.toFixed(2) || "0.00"} ${scanResult.marketValue?.currency || "USD"}`,
                icon: Tag,
              },
              {
                label: "Data Source",
                value: singleReportMeta?.provider || "IMEI Service",
                icon: Database,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl px-4 py-3 bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2 text-white/35">
                    <Icon size={14} />
                    <p className="text-[10px] font-black uppercase tracking-[0.18em]">
                      {item.label}
                    </p>
                  </div>
                  <p
                    className={`mt-2 text-sm font-black break-words ${item.accent || "text-white"}`}
                  >
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Checks Grid & Report Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-sm font-black text-[#0F172A] mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#84CC16]" />
            Security Checks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checksArray.map((check, i) => {
              const Icon = getCheckIcon(check?.title);
              const statusClass =
                check.status === "passed"
                  ? "bg-emerald-50 text-emerald-500"
                  : check.status === "warning"
                    ? "bg-amber-50 text-amber-500"
                    : "bg-red-50 text-red-500";
              return (
                <motion.div
                  key={check.title || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#84CC16]/30 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${statusClass}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#0F172A]">
                          {check?.title || "Check"}
                        </h3>
                        <p className="text-xs font-medium text-[#64748B] mt-0.5 max-w-[200px]">
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
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Report Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4 shadow-sm h-fit"
        >
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">
            Report Actions
          </span>
          <div className="space-y-3">
            <button className="w-full py-3.5 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-black text-sm hover:bg-[#84CC16]/5 transition flex items-center justify-center gap-2 cursor-pointer">
              <FileText size={16} />
              Create Smart Invoice
            </button>
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="w-full py-3.5 rounded-xl bg-[#84CC16] text-white font-black text-sm hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {isDownloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {isDownloading ? "Generating..." : "Download PDF Certificate"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Technical Breakdown */}
      {technicalItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#84CC16]/10 rounded-xl">
              <Database size={18} className="text-[#84CC16]" />
            </div>
            <h2 className="text-lg font-black text-[#0F172A]">
              Technical Breakdown
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {technicalItems.map((item) => (
              <div key={item.label} className="space-y-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                  {item.label}
                </span>
                <p className="text-sm font-bold text-[#0F172A] break-words">
                  {String(item.value)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Metadata Footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-50 rounded-3xl p-6 border border-gray-100"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
              Provider
            </p>
            <p className="text-sm font-bold text-gray-700">
              {singleReportMeta?.provider ||
                selectedService?.name ||
                "IMEI Service"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
              Service ID
            </p>
            <p className="text-sm font-bold text-gray-700">
              {singleReportMeta?.serviceId ??
                selectedService?.serviceId ??
                "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
              Scan Date
            </p>
            <p className="text-sm font-bold text-gray-700">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
              Report Status
            </p>
            <p className="text-sm font-bold text-emerald-600">Completed</p>
          </div>
        </div>
      </motion.div>

      {/* Hidden Certificate Container */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: "1100px",
          minHeight: "800px",
          backgroundColor: "white",
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        <CertificatePDF
          data={scanResult}
          id="certificate-pdf-single"
          providerName={singleReportMeta?.provider || selectedService?.name}
          serviceId={
            singleReportMeta?.serviceId ??
            selectedService?.serviceId ??
            undefined
          }
        />
      </div>
    </div>
  );
};
