import OtpVerify from "@/features/auth/component/OtpVerify";
import React, { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpVerify />
    </Suspense>
  );
}
