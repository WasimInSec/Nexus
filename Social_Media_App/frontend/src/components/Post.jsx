import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, MessageCircle, Share2 } from "lucide-react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import CommentDialog from "./CommentDialog";
import PostHeader from "./PostHeader";
import PostMedia from "./PostMedia";

const Post = ({ post, index }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isMediaZoomed, setIsMediaZoomed] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post?.likes?.length || 0);
  const [comment, setComment] = useState(post?.comments || []);
  const dispatch = useDispatch();

  const postVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.1 
      },
    },
    hover: {
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const iconAnimation = {
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.95 }
  };

  const likeAnimation = {
    scale: [1, 1.3, 1],
    rotate: [0, -15, 15, -15, 0],
    transition: { duration: 0.5 }
  };

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `http://localhost:3000/api/v1/post/${post._id}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update like status");
    }
  };

  const commentHandler = async () => {
    if (!text.trim()) return;
    
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/post/${post._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);
        dispatch(setPosts(posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        )));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add comment");
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/post/${post?._id}/bookmark`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsBookmarked(!isBookmarked);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to bookmark post");
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/v1/post/delete/${post?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(setPosts(posts.filter((p) => p?._id !== post?._id)));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete post");
    }
  };

  const shareHandler = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post.author.username}'s post`,
        text: post.caption,
        url: window.location.href,
      }).catch(console.error);
    } else {
      toast.error("Sharing is not supported on this device");
    }
  };

  return (
    <motion.div
      variants={postVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="my-8 w-full max-w-xl mx-auto bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-blue-100"
    >
      <div className="p-6">
        <PostHeader
          author={post.author}
          currentUserId={user._id}
          createdAt={post.createdAt}
          onDelete={deletePostHandler}
        />

        <motion.div
          onHoverStart={() => setIsMediaZoomed(true)}
          onHoverEnd={() => setIsMediaZoomed(false)}
          className="relative rounded-xl overflow-hidden shadow-inner mb-4"
        >
          <PostMedia
            mediaType={post.mediaType}
            url={post.mediaType === 'video' ? post.video : post.image}
            isMediaZoomed={isMediaZoomed}
          />
        </motion.div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <motion.div
              whileTap={likeAnimation}
              className="cursor-pointer"
            >
              {liked ? (
                <FaHeart
                  onClick={likeOrDislikeHandler}
                  size={28}
                  className="text-red-500 drop-shadow-sm"
                />
              ) : (
                <FaRegHeart
                  onClick={likeOrDislikeHandler}
                  size={28}
                  className="text-gray-600 hover:text-red-500 transition-colors"
                />
              )}
            </motion.div>
            <motion.div
              variants={iconAnimation}
              whileHover="hover"
              whileTap="tap"
            >
              <MessageCircle
                onClick={() => {
                  dispatch(setSelectedPost(post));
                  setOpen(true);
                }}
                className="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors"
                size={28}
              />
            </motion.div>
            <motion.div
              variants={iconAnimation}
              whileHover="hover"
              whileTap="tap"
            >
              <Share2
                onClick={shareHandler}
                className="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors"
                size={26}
              />
            </motion.div>
          </div>
          <motion.div
            variants={iconAnimation}
            whileHover="hover"
            whileTap="tap"
          >
            <Bookmark
              onClick={bookmarkHandler}
              className={`cursor-pointer transition-colors ${
                isBookmarked ? 'text-blue-600 fill-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
              size={26}
            />
          </motion.div>
        </div>

        <div className="space-y-3">
          <span className="font-semibold text-gray-800">
            {postLike.toLocaleString()} {postLike === 1 ? 'like' : 'likes'}
          </span>
          <p className="text-gray-800 leading-relaxed">
            <span className="font-semibold mr-2">{post.author?.username}</span>
            {post.caption}
          </p>
          {comment.length > 0 && (
            <motion.span
              whileHover={{ color: "#3B82F6" }}
              onClick={() => {
                dispatch(setSelectedPost(post));
                setOpen(true);
              }}
              className="cursor-pointer text-sm text-gray-500 block hover:underline"
            >
              View all {comment.length} comments
            </motion.span>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={changeEventHandler}
            className="flex-1 outline-none text-sm bg-white/50 rounded-full px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
          />
          {text && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={commentHandler}
              className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Post
            </motion.button>
          )}
        </motion.div>
      </div>
      <CommentDialog open={open} setOpen={setOpen} />
    </motion.div>
  );
};

export default Post;