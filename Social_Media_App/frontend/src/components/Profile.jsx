import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  AtSign,
  Heart,
  MessageCircle,
  LayoutGrid,
  Bookmark,
  Film,
  Tag,
  Edit3,
  Archive,
  MessageSquare,
  Settings,
} from "lucide-react";

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState("posts");
  const [hoveredPost, setHoveredPost] = useState(null);

  const { userProfile, user } = useSelector((store) => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = false;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const displayedPost = activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  console.log(userProfile?.posts.length);
  

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex max-w-5xl justify-center mx-auto pl-10 py-8"
    >
      <div className="flex flex-col gap-16 p-8 w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-violet-100">
        <div className="grid grid-cols-2 gap-8">
          <motion.section 
            variants={itemVariants}
            className="flex items-center justify-center"
          >
            <div className="relative group">
              <Avatar className="h-40 w-40 ring-4 ring-violet-200 ring-offset-4 transition-all duration-300 group-hover:ring-violet-400">
                <AvatarImage
                  src={userProfile?.profilePicture}
                  alt="profilephoto"
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white">
                  {userProfile?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <motion.div
                className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {userProfile?.username}
                </h1>
                {isLoggedInUserProfile ? (
                  <div className="flex gap-2">
                    <Link to="/account/edit">
                      <Button
                        variant="secondary"
                        className="bg-violet-50 hover:bg-violet-100 text-violet-700 gap-2"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Profile
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="bg-violet-50 hover:bg-violet-100 text-violet-700 gap-2"
                    >
                      <Archive className="w-4 h-4" /> Archive
                    </Button>
                    <Button
                      variant="secondary"
                      className="bg-violet-50 hover:bg-violet-100 text-violet-700"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ) : isFollowing ? (
                  <div className="flex gap-2">
                    <Button variant="secondary" className="bg-violet-50 hover:bg-violet-100 text-violet-700">
                      Unfollow
                    </Button>
                    <Button variant="secondary" className="bg-violet-50 hover:bg-violet-100 text-violet-700 gap-2">
                      <MessageSquare className="w-4 h-4" /> Message
                    </Button>
                  </div>
                ) : (
                  <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    Follow
                  </Button>
                )}
              </div>

              <motion.div 
                variants={itemVariants}
                className="flex items-center gap-8"
              >



                {[
                  { label: "posts", count: userProfile?.posts.length },
                  { label: "followers", count: userProfile?.followers.length },
                  { label: "following", count: userProfile?.following.length }
                ].map((item) => (
                  <div key={item.label} className="text-center group cursor-pointer">
                    <p className="text-2xl font-bold text-violet-700 group-hover:scale-110 transition-transform duration-300">
                      {item.count}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <span className="font-bold text-gray-800">
                  {userProfile?.bio || "Bio here..."}
                </span>
                <Badge className="w-fit bg-violet-100 text-violet-700 hover:bg-violet-200" variant="secondary">
                  <AtSign className="w-4 h-4" /> 
                  <span className="pl-1">{userProfile?.username}</span>
                </Badge>
                <div className="space-y-1 text-gray-600">
                  <p>🥑 Part-time avocado toast enthusiast, full-time overthinker</p>
                  <p>🌎✨ Living life one "what if" at a time</p>
                  <p>🦄 World's okay-est human</p>
                  <p>🤯 DM for collaboration</p>
                </div>
              </motion.div>
            </div>
          </motion.section>
        </div>

        <div className="border-t border-violet-100">
          <div className="flex items-center justify-center gap-12 -mt-px">
            {[
              { icon: <LayoutGrid className="w-4 h-4" />, label: "POSTS", value: "posts" },
              { icon: <Bookmark className="w-4 h-4" />, label: "SAVED", value: "saved" },
              { icon: <Film className="w-4 h-4" />, label: "REELS", value: "reels" },
              { icon: <Tag className="w-4 h-4" />, label: "TAGGED", value: "tagged" }
            ].map((tab) => (
              <motion.button
                key={tab.value}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => handleTabChange(tab.value)}
                className={`flex items-center gap-2 py-4 px-4 cursor-pointer transition-all duration-300 ${
                  activeTab === tab.value
                    ? "font-bold border-t-2 border-violet-600 text-violet-700"
                    : "text-gray-500 hover:text-violet-600"
                }`}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </div>

          <motion.div 
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-4 mt-8"
          >
            {displayedPost?.map((post, index) => (
              <motion.div
                key={post?._id}
                variants={itemVariants}
                className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                onHoverStart={() => setHoveredPost(post._id)}
                onHoverEnd={() => setHoveredPost(null)}
              >
                <img
                  src={post.image}
                  alt="post"
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPost === post._id ? 1 : 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-violet-900/90 via-violet-900/50 to-transparent backdrop-blur-sm"
                >
                  <div className="flex items-center text-white space-x-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center gap-2"
                    >
                      <Heart className="w-6 h-6 fill-white" />
                      <span className="text-lg font-semibold">{post?.likes.length}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-lg font-semibold">{post?.comments.length}</span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;