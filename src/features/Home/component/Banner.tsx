"use client";

import {
  Search,
  ChevronDown,
  QrCode,
  LogIn,
  X,
  Info,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getServicesApi } from "@/features/shoopkeeper/scanDevice/api/scanDevice.api";
import { IMEIService } from "@/features/shoopkeeper/scanDevice/types/scanDevice.types";

export default function Banner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imei, setImei] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [services, setServices] = useState<IMEIService[]>([]);
  const [selectedService, setSelectedService] = useState<IMEIService | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServicesApi();
        if (
          response.success &&
          response.data &&
          response.data["Service List"]
        ) {
          const list = response.data["Service List"];
          setServices(list);
          if (list.length > 0) {
            setSelectedService(list.find((s) => s.service === "6") || list[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter((svc) =>
    svc.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleSearch = () => {
    if (!imei) return;

    if (status === "authenticated") {
      const serviceId = selectedService?.service || "6";
      router.push(
        `/shpokeeper/scan-device?imei=${encodeURIComponent(imei)}&serviceId=${serviceId}`,
      );
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <section className="relative flex-1 flex items-center justify-center overflow-hidden ">
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/banner1.svg"
          alt="Gradient Background"
          fill
          priority
          className="object-cover"
        />

        <Image
          src="/images/Rasel.svg"
          alt="Lines Overlay"
          fill
          priority
          className="object-cover opacity-15 mix-blend-overlay"
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] md:w-[900px] h-[300px] sm:h-[600px] bg-white/50 blur-[80px] sm:blur-[120px] rounded-full" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-5xl w-full text-center px-4 md:px-6 py-10 md:py-0">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 md:mb-6 leading-tight"
        >
          Verify Global <span className="text-[#BEFB6D]">IMEI</span>
          <br />
          <span className="text-[#BEFB6D]">Intelligence</span> in Real-Time
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-base sm:text-lg md:text-xl mb-8 md:mb-12"
        >
          Advanced AI-powered diagnostics and blacklisting checks for secure{" "}
          <br className="hidden md:block" />
          device transactions and inventory management.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mb-4 md:mb-6 relative"
        >
          <div className="absolute inset-0 -m-4 border-3 border-white/30 rounded-[40px] sm:rounded-full pointer-events-none" />
          <div className="absolute inset-0 -m-8 border-2 border-white/20 rounded-[50px] sm:rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center bg-white/95 backdrop-blur-2xl rounded-[32px] md:rounded-full p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-white/50 relative z-10">
            <div className="flex items-center flex-1 w-full px-5 sm:px-6 gap-4 border-b md:border-b-0 md:border-r border-gray-100">
              <Search className="w-6 h-6 text-gray-400 shrink-0" />

              <input
                type="text"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter IMEI or Serial Number..."
                className="w-full bg-transparent outline-none text-gray-800 py-4 placeholder:text-gray-400 text-base sm:text-lg font-medium"
              />

              <button
                onClick={handleScanClick}
                title="Scan IMEI"
                className="p-3 hover:bg-gray-100 rounded-2xl transition-colors group cursor-pointer"
              >
                <QrCode className="w-6 h-6 text-gray-400 group-hover:text-[#84CC16]" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
            </div>

            <div className="relative w-full md:w-[320px]">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 rounded-2xl md:rounded-full transition-all cursor-pointer group hover:bg-gray-50"
              >
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">
                    Select Service
                  </span>
                  <span className="text-[15px] font-black text-[#0F172A] truncate w-full text-left">
                    {selectedService ? selectedService.name : "Loading..."}
                  </span>
                </div>
                <div
                  className={`p-2 rounded-xl transition-all duration-300 ${isDropdownOpen ? "bg-[#84CC16] text-white rotate-180" : "bg-gray-100 text-gray-400"}`}
                >
                  <ChevronDown size={18} strokeWidth={3} />
                </div>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    className="absolute right-0 top-full mt-4 w-full md:w-[450px] bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.2)] border border-white/50 overflow-hidden z-[100]"
                  >
                    {/* Search inside Dropdown */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search for a service..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] transition-all text-sm font-bold"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-3">
                      {filteredServices.length > 0 ? (
                        filteredServices.map((svc) => {
                          const isApple =
                            svc.name.toLowerCase().includes("apple") ||
                            svc.name.toLowerCase().includes("iphone");
                          const isSamsung = svc.name
                            .toLowerCase()
                            .includes("samsung");

                          return (
                            <button
                              key={svc.service}
                              onClick={() => {
                                setSelectedService(svc);
                                setIsDropdownOpen(false);
                                setSearchTerm("");
                              }}
                              className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all mb-1.5 group ${
                                selectedService?.service === svc.service
                                  ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/30"
                                  : "hover:bg-gray-50 border border-transparent hover:border-gray-100"
                              }`}
                            >
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                  selectedService?.service === svc.service
                                    ? "bg-white/20"
                                    : isApple
                                      ? "bg-gray-100 text-gray-600"
                                      : isSamsung
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-green-50 text-green-600"
                                }`}
                              >
                                <Info size={22} />
                              </div>
                              <div className="flex flex-col items-start flex-1 min-w-0">
                                <span
                                  className={`text-[14px] font-black truncate w-full text-left ${
                                    selectedService?.service === svc.service
                                      ? "text-white"
                                      : "text-[#0F172A]"
                                  }`}
                                >
                                  {svc.name}
                                </span>
                                <div className="flex items-center gap-3 mt-1">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-widest ${
                                      selectedService?.service === svc.service
                                        ? "text-white/70"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    Service ID: {svc.service}
                                  </span>
                                  <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                                  <span
                                    className={`text-[12px] font-black ${
                                      selectedService?.service === svc.service
                                        ? "text-white"
                                        : "text-[#84CC16]"
                                    }`}
                                  >
                                    ${svc.price}
                                  </span>
                                </div>
                              </div>
                              {selectedService?.service === svc.service && (
                                <motion.div layoutId="selected-check">
                                  <Check size={20} strokeWidth={4} />
                                </motion.div>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-10 text-center space-y-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                            <Search size={30} />
                          </div>
                          <p className="text-gray-400 font-bold text-sm">
                            No services found for &quot;{searchTerm}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        {filteredServices.length} Services available
                      </span>
                      <button className="text-[11px] font-black text-[#84CC16] uppercase tracking-widest hover:underline">
                        View All
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-8 sm:mt-10 mb-8 md:mb-10"
        >
          {[
            "iPhone all in one / best fee",
            "Samsung full report / best before buy",
            "Mac full check / best before buy",
          ].map((tag, i) => (
            <button
              key={i}
              onClick={() => {
                setImei("356782084912443");
              }}
              className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#84CC16]/20 text-white backdrop-blur-md border border-white/20 text-[10px] sm:text-sm transition cursor-pointer hover:bg-[#84CC16]/40"
            >
              {tag}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={handleSearch}
            className="bg-[#A3E635] text-[#0F172A] px-12 sm:px-16 py-4 rounded-full font-black shadow-xl text-lg cursor-pointer hover:bg-[#BEFB6D] transition-all active:scale-95 uppercase tracking-widest"
          >
            Free Checks
          </button>
        </motion.div>
      </div>

      {/* Login Required Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-900"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-6 pt-4">
                <div className="w-20 h-20 bg-[#84CC16]/10 rounded-3xl flex items-center justify-center text-[#84CC16]">
                  <LogIn size={40} strokeWidth={2.5} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">
                    Login Required
                  </h3>
                  <p className="text-[#64748B] font-medium leading-relaxed">
                    To check device IMEI details and access advanced reports,
                    please login to your account first.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="w-full py-4 bg-[#0F172A] text-white font-black rounded-2xl hover:bg-gray-800 transition shadow-xl active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm cursor-pointer"
                  >
                    Go to Login
                  </button>
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="w-full py-4 bg-gray-100 text-[#64748B] font-black rounded-2xl hover:bg-gray-200 transition active:scale-95 text-sm uppercase tracking-widest cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                  <Info size={14} />
                  <span>Only registered shopkeepers can verify devices.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
