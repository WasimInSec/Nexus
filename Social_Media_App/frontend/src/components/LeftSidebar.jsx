import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Link } from "react-router-dom";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user, suggestedUsers } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredUsers = suggestedUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const exploreItems = [
    {
      id: 1,
      title: "Photography",
      posts: 1234,
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
      description: "Capture life's beautiful moments through the lens",
      tags: ["#photography", "#camera", "#art"],
    },
    {
      id: 2,
      title: "Travel",
      image:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop",
      posts: 856,
      description: "Explore the world, one destination at a time",
      tags: ["#travel", "#adventure", "#wanderlust"],
    },
    {
      id: 3,
      title: "Food",
      posts: 2341,
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
      description: "Delicious recipes and culinary adventures",
      tags: ["#food", "#cooking", "#foodie"],
    },
    {
      id: 4,
      title: "Technology",
      posts: 945,
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
      description: "Stay updated with the latest tech trends",
      tags: ["#tech", "#innovation", "#future"],
    },
  ];

  const logoutHandler = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    setActiveItem(textType);
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      navigate("/chat");
    } else if (textType === "Search") {
      setSearchOpen(true);
    } else if (textType === "Explore") {
      setExploreOpen(true);
    }
  };

  const sidebarItems = [
    {
      icon: <Home className="transition-transform group-hover:scale-110" />,
      text: "Home",
    },
    {
      icon: <Search className="transition-transform group-hover:scale-110" />,
      text: "Search",
    },
    {
      icon: (
        <TrendingUp className="transition-transform group-hover:scale-110" />
      ),
      text: "Explore",
    },
    {
      icon: (
        <MessageCircle className="transition-transform group-hover:scale-110" />
      ),
      text: "Messages",
    },
    {
      icon: <Heart className="transition-transform group-hover:scale-110" />,
      text: "Notifications",
    },
    {
      icon: (
        <PlusSquare className="transition-transform group-hover:scale-110" />
      ),
      text: "Create",
    },
    {
      icon: (
        <Avatar className="w-6 h-6 ring-2 ring-violet-500 ring-offset-2 transition-all duration-300 group-hover:ring-offset-4">
          <AvatarImage src={user?.profilePicture} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    {
      icon: <LogOut className="transition-transform group-hover:scale-110" />,
      text: "Logout",
    },
  ];

  return (
    <>
      <div className="fixed top-0 z-10 left-0 px-4 border-r border-violet-100 w-[16%] h-screen bg-white/80 backdrop-blur-xl">
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-8 pl-3 relative group"
          >
            <h1 className="font-['Cinzel'] font-bold text-3xl tracking-wider bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent relative z-10 transition-all duration-500 group-hover:tracking-widest">
              NEXUS
            </h1>
            <div className="absolute -bottom-1 left-3 w-0 h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 transition-all duration-500 group-hover:w-[80%] opacity-0 group-hover:opacity-100"></div>
            <span className="absolute -top-1 left-3 font-['Rajdhani'] text-xs tracking-widest text-violet-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-full">
              SECURE MESSAGING
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            {sidebarItems.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => sidebarHandler(item.text)}
                key={index}
                className={`group flex items-center gap-3 relative hover:bg-violet-50 cursor-pointer rounded-xl p-3 transition-all duration-300 ${
                  activeItem === item.text ? "bg-violet-50 shadow-sm" : ""
                }`}
              >
                <span
                  className={`transition-colors duration-300 ${
                    activeItem === item.text
                      ? "text-violet-600"
                      : "text-gray-600"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`font-medium transition-colors duration-300 ${
                    activeItem === item.text
                      ? "text-violet-600"
                      : "text-gray-700"
                  }`}
                >
                  {item.text}
                </span>
                {item.text === "Notifications" &&
                  likeNotification.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          className="rounded-full h-5 w-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 absolute -top-1 -right-1 shadow-lg transition-transform duration-300 hover:scale-110"
                        >
                          {likeNotification.length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4 bg-white/90 backdrop-blur-lg border border-violet-100">
                        <div className="space-y-3">
                          {likeNotification.length === 0 ? (
                            <p className="text-center text-gray-500">
                              No new notifications
                            </p>
                          ) : (
                            likeNotification.map((notification) => (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={notification.userId}
                                className="flex items-center gap-3 p-2 hover:bg-violet-50 rounded-lg transition-colors duration-200"
                              >
                                <Avatar className="ring-2 ring-violet-200">
                                  <AvatarImage
                                    src={
                                      notification.userDetails?.profilePicture
                                    }
                                  />
                                  <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <p className="text-sm">
                                  <span className="font-semibold text-violet-700">
                                    {notification.userDetails?.username}
                                  </span>{" "}
                                  liked your post
                                </p>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <CreatePost open={open} setOpen={setOpen} />

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-xl border-violet-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Search Users
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" />
              <Input
                placeholder="Search users..."
                className="pl-10 border-violet-100 focus:ring-violet-500 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredUsers.map((user) => (
                <Link
                  to={`/profile/${user._id}`}
                  key={user._id}
                  className="flex items-center gap-3 p-3 hover:bg-violet-50 rounded-xl cursor-pointer transition-all duration-200 group"
                >
                  <Avatar className="ring-2 ring-violet-200 transition-all duration-300 group-hover:ring-violet-400">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.bio || "Bio here..."}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105">
                    Follow
                  </span>
                </Link>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-center text-gray-500 py-4">No users found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exploreOpen} onOpenChange={setExploreOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto bg-white/90 backdrop-blur-xl border-violet-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Explore Trending Categories
            </DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <div className="grid grid-cols-2 gap-6">
              {exploreItems.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={item.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === item.id ? null : item.id
                    )
                  }
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 ${
                    selectedCategory === item.id ? "col-span-2 h-96" : "h-64"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-violet-900/90 via-violet-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                      <motion.h3
                        layout
                        className="font-bold text-2xl text-white mb-2"
                      >
                        {item.title}
                      </motion.h3>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-violet-200 mb-3">
                          {item.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs font-semibold text-white bg-violet-500/30 rounded-full backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-violet-200 text-sm">
                            {item.posts.toLocaleString()} posts
                          </span>
                          <Button
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                          >
                            View All
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeftSidebar;
