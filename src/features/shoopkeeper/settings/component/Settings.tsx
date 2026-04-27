"use client";

import React from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  MapPin,
  Pencil,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  DollarSign,
  Fingerprint,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Settings() {
  const [showCurrentPass, setShowCurrentPass] = React.useState(false);
  const [showNewPass, setShowNewPass] = React.useState(false);
  const [showConfirmPass, setShowConfirmPass] = React.useState(false);

  return (
    <div className="p-4 md:p-10 max-w-[1200px] mx-auto space-y-8 font-poppins">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex items-center gap-6"
      >
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner">
          <Image
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Demo Name
          </h1>
          <p className="text-[#64748B] font-bold text-sm">Shopkeeper Admin</p>
        </div>
      </motion.div>

      {/* Personal Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 flex justify-between items-center border-b border-gray-50">
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
            Personal Information
          </h2>
          <button className="flex items-center gap-2 px-6 py-2 bg-[#84CC16] text-white font-black text-sm rounded-xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 cursor-pointer">
            <Pencil size={16} strokeWidth={3} />
            <span>Edit</span>
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Name */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                First Name
              </label>
              <input
                type="text"
                defaultValue="Demo"
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="example@gmail.com"
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                Phone
              </label>
              <input
                type="text"
                defaultValue="(307) 555-0133"
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                Company Name
              </label>
              <input
                type="text"
                placeholder="Company Name"
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
              />
            </div>

            {/* Tax Number */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                Tax Number
              </label>
              <input
                type="text"
                defaultValue="(307) 555-0133"
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                Country
              </label>
              <input
                type="text"
                placeholder="Company Name"
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                Currency
              </label>
              <input
                type="text"
                defaultValue="Doller"
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                Address
              </label>
              <input
                type="text"
                placeholder="Address"
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                Bio
              </label>
              <textarea
                rows={5}
                defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B] resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Change Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-gray-50">
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
            Change password
          </h2>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  defaultValue="..............."
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
                />
                <button
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
                >
                  {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  defaultValue="..............."
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
                />
                <button
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#0F172A] ml-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  defaultValue="..............."
                  className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold text-[#64748B]"
                />
                <button
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
                >
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button className="px-10 py-4 bg-[#84CC16] text-white font-black text-[15px] rounded-2xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 cursor-pointer">
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
