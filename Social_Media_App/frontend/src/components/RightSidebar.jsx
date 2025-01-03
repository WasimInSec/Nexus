import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUsers from "./SuggestedUsers";
import { Button } from "./ui/button";
import { Settings, ExternalLink } from "lucide-react";

const RightSidebar = () => {
  const { userProfile, user } = useSelector((store) => store.auth);

  return (
    <div className="fixed top-0 right-0 w-[20%] h-screen bg-white/80 backdrop-blur-xl border-l border-violet-100 px-6">
      <div className="my-8 space-y-6">
        {/* User Profile Section */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-100/50 group">
          <Link
            to={`/profile/${user?._id}`}
            className="flex items-center gap-4"
          >
            <Avatar className="h-12 w-12 ring-2 ring-violet-200 transition-all duration-300 group-hover:ring-violet-400 group-hover:scale-105">
              <AvatarImage src={user?.profilePicture} alt="profile_image" />
              <AvatarFallback className="bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white">
                {user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                {user?.username}
              </h1>
              <p className="text-sm text-gray-600 line-clamp-1">
                {user?.bio || "Add your bio..."}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Settings className="h-4 w-4 text-violet-600" />
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-2 p-4 rounded-xl bg-gradient-to-r from-violet-50/50 to-fuchsia-50/50">
          <div className="text-center p-2 rounded-lg hover:bg-white/80 transition-colors duration-300">
            <p className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {userProfile?.posts.length || 0}
            </p>
            <p className="text-xs text-gray-600">Posts</p>
          </div>
          <div className="text-center p-2 rounded-lg hover:bg-white/80 transition-colors duration-300">
            <p className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {user?.followers?.length || 0}
            </p>
            <p className="text-xs text-gray-600">Followers</p>
          </div>
          <div className="text-center p-2 rounded-lg hover:bg-white/80 transition-colors duration-300">
            <p className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {user?.following?.length || 0}
            </p>
            <p className="text-xs text-gray-600">Following</p>
          </div>
        </div>

        <div className="space-y-2">
          <SuggestedUsers />
        </div>

        {/* Quick Links */}
        <div className="pt-4 border-t border-violet-100">
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <a
              href="#"
              className="hover:text-violet-600 transition-colors duration-200"
            >
              About
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-violet-600 transition-colors duration-200"
            >
              Help
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-violet-600 transition-colors duration-200"
            >
              Privacy
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-violet-600 transition-colors duration-200"
            >
              Terms
            </a>
          </div>
          <p className="mt-2 text-xs text-gray-400"></p>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
