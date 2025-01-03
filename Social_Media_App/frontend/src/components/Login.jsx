import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import OTPVerification from "./OTPVerification";
import { motion } from "framer-motion";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        if (res.data.requiresOTP) {
          setUserId(res.data.userId);
          setRequiresOTP(true);
          toast.success("OTP sent to your email");
        } else {
          dispatch(setAuthUser(res.data.user));
          navigate("/");
          toast.success(res.data.message);
        }
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (requiresOTP && userId) {
    return <OTPVerification userId={userId} isLogin={true} />;
  }

  return (
    <div className="flex items-center w-screen h-screen justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <form
          onSubmit={loginHandler}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mx-4 border border-purple-100"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="my-6 text-center"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600">
              Login to see photos & videos from your friends
            </p>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={input.email}
                onChange={changeEventHandler}
                className="pl-10 focus-visible:ring-purple-400 transition-all duration-300 border-purple-100"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={input.password}
                onChange={changeEventHandler}
                className="pl-10 focus-visible:ring-purple-400 transition-all duration-300 border-purple-100"
                required
              />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {loading ? (
                <Button
                  disabled
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  Login
                </Button>
              )}
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6 text-gray-600"
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-purple-600 hover:text-pink-600 transition-colors duration-300 font-medium"
            >
              Sign up
            </Link>
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;