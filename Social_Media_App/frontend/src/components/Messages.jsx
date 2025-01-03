import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRTM from "@/hooks/useGetRTM";

const Messages = ({ selectedUser }) => {
  useGetRTM();
  useGetAllMessage();
  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const profileCardVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="overflow-y-auto flex-1 p-6 bg-gradient-to-b from-purple-50/50 via-pink-50/30 to-white">
      <motion.div
        variants={profileCardVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-center mb-8"
      >
        <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="h-20 w-20 ring-4 ring-purple-100">
              <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
              <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 text-xl">
                {selectedUser?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <span className="mt-4 font-medium text-gray-900 text-lg">
            {selectedUser?.username}
          </span>
          <Link to={`/profile/${selectedUser?._id}`}>
            <Button 
              className="h-8 mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
              variant="default"
            >
              View profile
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        {messages &&
          messages.map((msg, index) => {
            const isSender = msg.senderId === user?._id;
            return (
              <motion.div
                key={msg._id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-2xl max-w-md break-words ${
                    isSender
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none shadow-purple-100"
                      : "bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-none border border-purple-100"
                  } shadow-lg`}
                >
                  {msg.message}
                </motion.div>
              </motion.div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Messages;