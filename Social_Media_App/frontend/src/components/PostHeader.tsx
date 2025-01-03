import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { format, isValid } from "date-fns";

interface PostHeaderProps {
  author: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  currentUserId: string;
  createdAt: string;
  onDelete: () => void;
}

const PostHeader = ({ author, currentUserId, createdAt, onDelete }: PostHeaderProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMM d, yyyy") : "Date unavailable";
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <motion.div 
          whileHover={{ scale: 1.1 }} 
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <Avatar className="h-12 w-12 ring-2 ring-blue-200 ring-offset-2 cursor-pointer">
            <AvatarImage src={author.profilePicture} alt="profile" />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
              {author.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <motion.div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.div>
        <div>
          <h1 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors text-lg">
            {author.username}
          </h1>
          <div className="flex items-center gap-2">
            {currentUserId === author._id && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-600">
                Author
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              {formatDate(createdAt)}
            </span>
          </div>
        </div>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <MoreHorizontal className="cursor-pointer text-gray-600 hover:text-blue-600" />
          </motion.div>
        </DialogTrigger>
        <DialogContent className="flex flex-col items-center gap-2 p-4 bg-white/90 backdrop-blur-sm">
          {author._id !== currentUserId && (
            <Button
              variant="ghost"
              className="w-full text-red-500 font-semibold hover:bg-red-50"
            >
              Unfollow
            </Button>
          )}
          <Button variant="ghost" className="w-full hover:bg-blue-50 text-blue-600">
            Add to favorites
          </Button>
          {currentUserId === author._id && (
            <Button
              onClick={onDelete}
              variant="ghost"
              className="w-full text-red-500 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostHeader;