import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Mail, KeyRound } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { cn } from "@/lib/utils";

const OTPVerification = ({ userId, isLogin = false }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const verifyOTP = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const endpoint = isLogin ? "/verify-login-otp" : "/verify-email";
      const res = await axios.post(
        `http://localhost:3000/api/v1/user${endpoint}`,
        {
          userId,
          otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        if (isLogin) {
          dispatch(setAuthUser(res.data.user));
          navigate("/");
        } else {
          navigate("/chat");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setLoading(true);
      const endpoint = isLogin ? "/resend-login-otp" : "/resend-signup-otp";
      const res = await axios.post(
        `http://localhost:3000/api/v1/user${endpoint}`,
        {
          userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("New OTP sent to your email");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-pink-200/40 to-purple-300/40 blur-3xl" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-200/40 to-pink-300/40 blur-3xl" />
      </div>

      <form
        onSubmit={verifyOTP}
        className="relative bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl flex flex-col gap-6 p-12 w-full max-w-md mx-4 border border-white/20"
      >
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-xl opacity-30" />
            <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 p-4 rounded-full">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-center font-bold text-2xl tracking-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Verify Your Email
          </h1>
          <p className="text-sm text-center text-gray-600 max-w-sm">
            We've sent a 6-digit OTP to your email address. Please enter it
            below to verify your account.
          </p>
        </div>

        <div className="space-y-2">
          <label className="font-semibold text-sm text-gray-700">
            Enter OTP Code
          </label>
          <Input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={cn(
              "text-lg py-6 text-center tracking-[0.5em] font-bold",
              "focus-visible:ring-2 focus-visible:ring-purple-500/50 transition-all",
              "border-gray-200 bg-white/50 backdrop-blur-sm"
            )}
            maxLength={6}
            placeholder="••••••"
            required
          />
        </div>

        <div className="space-y-3 mt-2">
          <Button
            disabled={loading}
            type="submit"
            className={cn(
              "w-full py-6 text-lg font-semibold",
              "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700",
              "transition-all duration-300 ease-out",
              "shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={resendOTP}
            disabled={loading}
            className={cn(
              "w-full py-6 text-lg font-semibold",
              "border-2 hover:bg-gray-50/50",
              "text-gray-700 hover:text-gray-900"
            )}
          >
            Resend OTP
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          Didn't receive the code? Check your spam folder or request a new one.
        </p>
      </form>
    </div>
  );
};

export default OTPVerification;
