import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

interface PostMediaProps {
  mediaType: 'image' | 'video';
  url: string;
  isMediaZoomed: boolean;
}

const PostMedia = ({ mediaType, url, isMediaZoomed }: PostMediaProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const imageZoomVariants = {
    normal: { scale: 1 },
    zoomed: { scale: 1.05 }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error("Video playback failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  if (mediaType === 'video') {
    return (
      <div className="relative group">
        <video
          ref={videoRef}
          className="w-full aspect-video object-cover cursor-pointer"
          src={url}
          playsInline
          preload="metadata"
          controls={isPlaying}
          onEnded={handleVideoEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleVideo}
              className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors cursor-pointer"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white/90 p-4 rounded-full"
              >
                <Play className="w-8 h-8 text-blue-600" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <img
      className="w-full aspect-square object-cover transition-transform duration-300"
      src={url}
      alt="post content"
      loading="lazy"
    />
  );
};

export default PostMedia;