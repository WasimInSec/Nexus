import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, User, Mail, Lock, UserCircle } from "lucide-react";
import { useSelector } from "react-redux";
import OTPVerification from "./OTPVerification";
import { motion } from "framer-motion";

const Signup = () => {
  const [input, setInput] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setUserId(res.data.userId);
        toast.success(res.data.message);
        setInput({
          name: "",
          username: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (userId) {
    return <OTPVerification userId={userId} isLogin={false} />;
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
          onSubmit={signupHandler}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mx-4 border border-purple-100"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="my-6 text-center"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-sm text-gray-600">
              Join to see photos & videos from your friends
            </p>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
              <Input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={input.name}
                onChange={changeEventHandler}
                className="pl-10 focus-visible:ring-purple-400 transition-all duration-300 border-purple-100"
                required
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
              <Input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={input.username}
                onChange={changeEventHandler}
                className="pl-10 focus-visible:ring-purple-400 transition-all duration-300 border-purple-100"
                required
              />
            </div>

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
                placeholder="Create a password"
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
                  Sign up
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
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-600 hover:text-pink-600 transition-colors duration-300 font-medium"
            >
              Login
            </Link>
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
