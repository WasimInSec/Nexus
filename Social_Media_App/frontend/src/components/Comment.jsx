import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion } from 'framer-motion';

function Comment({ comment }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="my-3 p-3 rounded-lg hover:bg-white/50 transition-colors duration-200"
    >
      <div className="flex gap-4 items-start">
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <Avatar className="h-10 w-10 ring-2 ring-purple-100 ring-offset-2 transition-all duration-200 hover:ring-purple-200">
            <AvatarImage 
              src={comment?.author?.profilePicture} 
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
              {comment?.author?.username?.slice(0, 2)?.toUpperCase() || 'CN'}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800 hover:text-purple-600 transition-colors duration-200">
              {comment?.author?.username}
            </h3>
            <span className="text-xs text-gray-500">• 2h ago</span>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-gray-600 text-sm leading-relaxed"
          >
            {comment?.text}
          </motion.p>
          
          <div className="mt-2 flex gap-4">
            <button className="text-xs text-gray-500 hover:text-purple-600 transition-colors duration-200 flex items-center gap-1">
              <span>Reply</span>
            </button>
            <button className="text-xs text-gray-500 hover:text-purple-600 transition-colors duration-200 flex items-center gap-1">
              <span>Like</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Comment;