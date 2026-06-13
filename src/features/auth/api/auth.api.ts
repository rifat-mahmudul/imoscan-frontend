// src/features/auth/api/auth.api.ts

import axiosInstance from "@/lib/instance/axios-instance";
import {
  ApiResponse,
  AuthResponseData,
  VerifyEmailResponse,
  ForgotPasswordResponse,
  VerifyOtpResponse,
  RegisterPayload,
  LoginPayload,
} from "../types/auth.types";

/**
 * Register a new user
 */
export const registerUserApi = async (
  data: RegisterPayload,
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await axiosInstance.post("/user/register", data);
  return response.data;
};

/**
 * Login user
 */
export const loginUserApi = async (
  data: LoginPayload,
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

/**
 * Verify email with OTP
 */

export const verifyEmailApi = async (
  otp: string,
  token?: string,
): Promise<ApiResponse<VerifyEmailResponse>> => {
  const headers = token ? { _customToken: token } : {};
  const response = await axiosInstance.post(
    "/user/verify-email",
    { otp },
    { headers },
  );
  return response.data;
};

/**
 * Resend OTP for email verification
 */
export const resendOtpApi = async (
  token?: string,
): Promise<ApiResponse<VerifyEmailResponse>> => {
  const headers = token ? { _customToken: token } : {};
  const response = await axiosInstance.post(
    "/user/resend-otp",
    {},
    { headers },
  );
  return response.data;
};

/**
 * Forgot password - sends OTP to email
 */
export const forgotPasswordApi = async (
  email: string,
): Promise<ApiResponse<ForgotPasswordResponse>> => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};

/**
 * Resend OTP for forgot password
 */
export const resendForgotOtpApi = async (
  token?: string,
): Promise<ApiResponse> => {
  const headers = token ? { _customToken: token } : {};
  const response = await axiosInstance.post(
    "/auth/resend-forgot-otp",
    {},
    { headers },
  );
  return response.data;
};

/**
 * Verify OTP for password reset
 */
export const verifyOtpApi = async (
  otp: string,
  token?: string,
): Promise<ApiResponse<VerifyOtpResponse>> => {
  const headers = token ? { _customToken: token } : {};
  const response = await axiosInstance.post(
    "/auth/verify-otp",
    { otp },
    { headers },
  );
  return response.data;
};

/**
 * Reset password with new password
 */
export const resetPasswordApi = async (
  newPassword: string,
  token?: string,
): Promise<ApiResponse> => {
  const headers = token ? { _customToken: token } : {};
  const response = await axiosInstance.post(
    "/auth/reset-password",
    { newPassword },
    { headers },
  );
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshAccessTokenApi = async (
  refreshToken: string,
): Promise<ApiResponse<{ accessToken: string }>> => {
  const response = await axiosInstance.post("/auth/refresh-token", {
    refreshToken,
  });
  return response.data;
};
