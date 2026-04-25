"use client";

import { motion } from "framer-motion";
import {
  Search,
  HelpCircle,
  AlertCircle,
  CircleDollarSign,
} from "lucide-react";

const steps = [
  {
    title: "Scan IMEI / Serial",
    description:
      "Quickly scan or enter the device's IMEI or serial number to start the check.",
    icon: Search,
    bgColor: "bg-[#EEFBCC]", // Light Lime
  },
  {
    title: "View Device Info",
    description:
      "Get full details on the device model, specification, and warranty status.",
    icon: HelpCircle,
    bgColor: "bg-[#E1F0FF]", // Light Blue
  },
  {
    title: "Check Blacklist Status",
    description:
      "Instantly see if the device is reported lost, stolen, financed, or blacklisted.",
    icon: AlertCircle,
    bgColor: "bg-[#F1EAFF]", // Light Purple
  },
  {
    title: "See Market Value",
    description:
      "Get the real-time market value so you know how much the device is worth.",
    icon: CircleDollarSign,
    bgColor: "bg-[#E1FBFF]", // Light Cyan
  },
];

export default function VerifyAnyDevices() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto container px-6">
        {/* Heading Area */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#A3E635] font-bold tracking-[0.2em] text-xs md:text-sm mb-3"
          >
            4 STEPS TO
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-[#0F172A]"
          >
            Verify Any Devices
          </motion.h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${step.bgColor} p-10 md:p-12 rounded-[40px] flex flex-col items-center text-center transition-transform hover:scale-[1.02] duration-300`}
            >
              {/* Icon Circle */}
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-black/5">
                <step.icon className="w-6 h-6 text-[#0F172A]" />
              </div>

              {/* Text Content */}
              <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
                {step.title}
              </h3>
              <p className="text-[#64748B] text-sm md:text-base leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
