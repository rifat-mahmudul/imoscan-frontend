"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const { status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 mx-auto container">
        {/* Logo */}
        <div className="relative w-[100px] md:w-[150px] h-[40px] md:h-[50px]">
          <Image
            src="/images/logo.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>

        {/* Login and Get Started buttons */}
        <div className="flex gap-2 md:gap-4 items-center">
          {/* Login button - Only show if NOT authenticated */}
          {status !== "authenticated" && (
            <Link href="/auth/login">
              <div className="border border-[#84CC16] text-[#84CC16] px-5 py-2 rounded-full cursor-pointer hover:bg-[#84CC16] hover:text-white transition-all text-sm md:text-base font-bold">
                Login
              </div>
            </Link>
          )}

          {/* Get Started / Dashboard button */}
          <Link
            href={
              status === "authenticated"
                ? "/shpokeeper/scan-device"
                : "/auth/sign-up"
            }
          >
            <div className="bg-[#84CC16] text-white px-5 md:px-8 py-2 rounded-full cursor-pointer hover:bg-[#6ABF12] transition-all text-sm md:text-base font-bold shadow-lg shadow-lime-500/20">
              {status === "authenticated" ? "Scan Now" : "Get Started"}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
