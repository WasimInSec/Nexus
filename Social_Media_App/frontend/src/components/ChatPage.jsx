import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircle, Search, Send } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { setMessages } from "@/redux/chatSlice";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();

  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const newMessage = res.data.newMessage;
        dispatch(setMessages([...messages, newMessage]));

        if (socket) {
          socket.emit("sendMessage", {
            message: newMessage,
            receiverId: selectedUser._id,
          });
        }

        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageHandler(selectedUser?._id);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  const sidebarVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      } 
    },
  };

  const listItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.1 },
    }),
  };

  if (!user) return null;

  return (
    <div className="flex ml-[16%] h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white">
      <motion.section
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="w-full md:w-1/4 my-8 bg-white/80 backdrop-blur-sm rounded-r-xl shadow-lg border-r border-purple-100"
      >
        <div className="p-6">
          <h1 className="font-bold mb-4 text-xl text-gray-800 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            Messages
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder="Search messages..."
              className="pl-9 bg-purple-50/50 border-purple-100 focus:border-purple-200 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-12rem)] scrollbar-hide">
          {suggestedUsers.map((suggestedUser, i) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            return (
              <motion.div
                key={suggestedUser._id}
                custom={i}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.05)" }}
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className={`flex gap-3 items-center p-4 cursor-pointer transition-all duration-300 ${
                  selectedUser?._id === suggestedUser._id 
                    ? "bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500" 
                    : "border-l-4 border-transparent hover:border-pink-300"
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 ring-2 ring-purple-100">
                    <AvatarImage src={suggestedUser?.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600">
                      {suggestedUser?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"
                    />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-gray-900">
                    {suggestedUser?.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isOnline ? "Active now" : "Offline"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {selectedUser ? (
          <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="flex-1 bg-white/80 backdrop-blur-sm shadow-lg rounded-l-xl flex flex-col h-full ml-4 border-l border-purple-100"
          >
            <div className="flex gap-3 items-center px-6 py-4 border-b border-purple-100 bg-white/90">
              <Avatar className="ring-2 ring-purple-100">
                <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600">
                  {selectedUser?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{selectedUser?.username}</span>
                <span
                  className={`text-xs ${
                    onlineUsers.includes(selectedUser._id)
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {onlineUsers.includes(selectedUser._id)
                    ? "online"
                    : "offline"}
                </span>
              </div>
            </div>

            <Messages selectedUser={selectedUser} />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-2 p-4 border-t border-purple-100 bg-white/90"
            >
              <Input
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                type="text"
                className="flex-1 bg-purple-50/50 border-purple-100 focus:border-purple-200 transition-all"
                placeholder="Type a message..."
              />
              <Button
                onClick={() => sendMessageHandler(selectedUser?._id)}
                disabled={!textMessage.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.section>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white/80 backdrop-blur-sm p-12 rounded-2xl shadow-lg border border-purple-100"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <MessageCircle className="w-32 h-32 text-purple-200" />
              </motion.div>
              <h1 className="font-medium text-xl mt-6 text-gray-800">
                Your messages
              </h1>
              <span className="text-gray-500 mt-2 block">
                Select a chat to start messaging
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;