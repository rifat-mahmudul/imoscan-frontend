"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  CircleX,
  Zap,
  Sparkles,
  FileText,
  Award,
  Gem,
} from "lucide-react";

export default function Pricing() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto container px-6 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black text-[#0F172A] mb-4"
        >
          Flexible <span className="text-[#3B82F6]">Pricing</span> That Fits
          Your <span className="text-[#84CC16]">Needs</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[#64748B] text-lg mb-16"
        >
          Start free, pay as you grow, or save more with subscriptions.
        </motion.p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {/* Starter Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#E1F0FF] rounded-[40px] p-10 flex flex-col items-start text-left h-full"
          >
            <span className="bg-white text-[#3B82F6] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-6">
              Starter
            </span>
            <div className="flex items-baseline gap-1 mb-10">
              <span className="text-4xl font-black text-[#0F172A]">$0</span>
              <span className="text-sm font-bold text-[#64748B]">/month</span>
            </div>

            <div className="space-y-4 mb-10 w-full">
              <FeatureItem
                icon={<CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />}
                text="2 Free Checks"
              />
              <FeatureItem
                icon={<CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />}
                text="Basic Device Report"
              />
              <FeatureItem
                icon={<CircleX className="w-5 h-5 text-[#94A3B8]" />}
                text="No AI Explanation"
                active={false}
              />
            </div>

            <button className="w-full mt-auto bg-white hover:bg-gray-50 border border-[#84CC16] text-[#0F172A] font-bold py-4 rounded-2xl transition shadow-sm  text-[#84CC16] cursor-pointer">
              Start Free
            </button>
          </motion.div>

          {/* Featured Card: Custom Top-up */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#EEFBCC] rounded-[40px] p-10 flex flex-col items-start text-left h-full relative border-2 border-[#84CC16]/20"
          >
            {/* Featured Badge */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 whitespace-nowrap">
              Most Flexible
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#64748B] mb-2">
                Custom Top-up
              </h3>
              <div className="text-4xl font-black text-[#0F172A] mb-10">
                $2 – $30
              </div>
            </div>

            <div className="space-y-4 mb-10 w-full">
              <FeatureItem
                icon={<Zap className="w-5 h-5 text-[#3B82F6]" />}
                text="Top-up from $2 to $30"
              />
              <FeatureItem
                icon={<Sparkles className="w-5 h-5 text-[#3B82F6]" />}
                text="AI explanation"
              />
              <FeatureItem
                icon={<FileText className="w-5 h-5 text-[#3B82F6]" />}
                text="Powerful invoicing available"
              />
              <FeatureItem
                icon={<Award className="w-5 h-5 text-[#3B82F6]" />}
                text="Certificate available"
              />
            </div>

            <button className="w-full mt-auto bg-[#84CC16] hover:bg-[#6fa512] text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-lime-500/20 cursor-pointer">
              Top Up & Start
            </button>
          </motion.div>

          {/* Enterprise Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#F3E8FF] rounded-[40px] p-10 flex flex-col items-start text-left h-full"
          >
            <h3 className="text-3xl font-black text-[#0F172A] mb-10">
              Enterprise
            </h3>

            <div className="space-y-4 mb-8 w-full">
              <FeatureItem
                icon={<Zap className="w-5 h-5 text-[#3B82F6]" />}
                text="Top-up from $2 to $30"
              />
              <FeatureItem
                icon={<Sparkles className="w-5 h-5 text-[#3B82F6]" />}
                text="AI explanation"
              />
              <FeatureItem
                icon={<FileText className="w-5 h-5 text-[#3B82F6]" />}
                text="Powerful invoicing available"
              />
            </div>

            {/* Special Offer Pill */}
            <div className="w-full bg-white rounded-2xl p-4 flex items-center justify-between mb-8 border border-purple-100 shadow-sm">
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-[#3B82F6]" />
                <span className="text-sm font-bold text-[#0F172A]">
                  Diamond
                </span>
              </div>
              <span className="text-[10px] font-black text-[#84CC16] bg-[#F0FDF4] px-2 py-1 rounded-lg uppercase">
                10% Off
              </span>
            </div>

            <button className="w-full mt-auto bg-white hover:bg-gray-50 text-[#0F172A] font-bold py-4 rounded-2xl transition shadow-sm border border-[#84CC16] text-[#84CC16] cursor-pointer">
              View Plans
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({
  icon,
  text,
  active = true,
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span
        className={`text-sm font-semibold ${active ? "text-[#1E293B]" : "text-[#94A3B8] line-through decoration-2"}`}
      >
        {text}
      </span>
    </div>
  );
}
