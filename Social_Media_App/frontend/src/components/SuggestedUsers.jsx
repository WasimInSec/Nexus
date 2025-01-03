import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector(store => store.auth);
  const [followingStates, setFollowingStates] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  const handleFollow = async (userId) => {
    setLoadingStates(prev => ({ ...prev, [userId]: true }));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setFollowingStates(prev => ({ ...prev, [userId]: !prev[userId] }));
    setLoadingStates(prev => ({ ...prev, [userId]: false }));
  };

  return (
    <div className='my-10'>
      <div className='flex items-center justify-between text-sm'>
        <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
        <span className='font-medium cursor-pointer hover:text-gray-800 transition-colors'>
          See All
        </span>
      </div>
      {suggestedUsers.map((user) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={user._id}
          className='flex items-center justify-between my-5'
        >
          <div className='flex items-center gap-2'>
            <Link to={`/profile/${user?._id}`}>
              <Avatar className="ring-2 ring-violet-100 transition-all duration-300 hover:ring-violet-300">
                <AvatarImage src={user?.profilePicture} alt={user?.username} />
                <AvatarFallback className="bg-gradient-to-br from-violet-100 to-pink-100 text-violet-600">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link to={`/profile/${user?._id}`}>
                <h1 className='font-semibold text-sm hover:text-violet-600 transition-colors'>
                  {user?.username}
                </h1>
              </Link>
              <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.button
              key={followingStates[user._id] ? 'following' : 'follow'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFollow(user._id)}
              disabled={loadingStates[user._id]}
              className={`relative px-4 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                followingStates[user._id]
                  ? 'bg-violet-100 text-violet-600 hover:bg-red-100 hover:text-red-600'
                  : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white'
              }`}
            >
              {loadingStates[user._id] ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                />
              ) : followingStates[user._id] ? (
                <span className="group-hover:hidden">Following</span>
              ) : (
                <span>Follow</span>
              )}
            </motion.button>
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default SuggestedUsers;