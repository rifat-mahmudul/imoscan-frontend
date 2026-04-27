"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/shpokeeper/scan-device");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-poppins relative">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 transition-all group font-bold text-sm"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[580px] bg-white rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 md:p-14 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-gray-100"
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6 text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F172A] mb-2 sm:mb-4 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-[#64748B] text-sm sm:text-[15px] font-medium leading-relaxed">
            Enter your credentials to manage your attractions.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <div>
            <input
              type="email"
              required
              placeholder="hello@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-6 py-4 sm:px-8 sm:py-5 rounded-full border border-gray-200 focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-semibold text-sm sm:text-base"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-6 py-4 sm:px-8 sm:py-5 rounded-full border border-gray-200 focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-[#1E293B] placeholder:text-gray-400 font-semibold text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
            >
              {showPassword ? (
                <EyeOff size={20} className="sm:w-[22px] sm:h-[22px]" />
              ) : (
                <Eye size={20} className="sm:w-[22px] sm:h-[22px]" />
              )}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:bg-[#84CC16] checked:border-[#84CC16] transition-all"
                />
                <svg
                  className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none cursor-pointer"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#64748B] group-hover:text-[#0F172A] transition">
                Remember me
              </span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs sm:text-sm font-black text-[#0F172A] hover:text-[#84CC16] transition underline underline-offset-4 decoration-2"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#84CC16] text-white font-black py-3 sm:py-3 rounded-full shadow-sm shadow-lime-500/20 text-base sm:text-lg mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-4 sm:mt-6 text-sm sm:text-[15px] font-bold text-[#64748B]">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-[#0F172A] hover:text-[#84CC16] transition border-b-2 border-transparent hover:border-[#84CC16] ml-1"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
