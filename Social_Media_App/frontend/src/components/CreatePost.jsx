import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL, formatFileSize, isValidFileType } from "@/lib/utils";
import { Loader2, ImagePlus, X, Film, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./ui/progress";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const CreatePost = ({ open, setOpen }) => {
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!isValidFileType(selectedFile)) {
      toast.error("Unsupported file type. Please upload an image or video.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    setFile(selectedFile);
    const dataUrl = await readFileAsDataURL(selectedFile);
    setMediaPreview(dataUrl);
  };

  const createPostHandler = async (e) => {
    if (!caption.trim() && !file) {
      toast.error("Please add a caption or media");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    
    if (file) {
      formData.append("file", file); // Changed to match multer field name
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/api/v1/post/addpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(Math.round(progress));
          },
        }
      );
      
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
        setCaption("");
        setMediaPreview("");
        setFile(null);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Error creating post");
    } finally {
      setLoading(false);
    }
  };

  const removeMedia = () => {
    setMediaPreview("");
    setFile(null);
    setUploadProgress(0);
  };

  const isVideo = file?.type.startsWith('video/');

  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-[500px] overflow-hidden bg-white/95 backdrop-blur-sm border border-violet-200"
        onInteractOutside={() => !loading && setOpen(false)}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex gap-3 items-center p-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl">
            <Avatar className="ring-2 ring-violet-200 transition-all duration-300 hover:ring-violet-400">
              <AvatarImage src={user?.profilePicture} alt={user?.username} />
              <AvatarFallback className="bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white">
                {user?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {user?.username}
              </h1>
              <span className="text-gray-600 text-xs">Share your moments...</span>
            </div>
          </div>

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="focus-visible:ring-violet-400 min-h-[100px] border-violet-100 placeholder:text-gray-400 transition-all duration-300"
            placeholder="Write a caption..."
          />

          <AnimatePresence>
            {mediaPreview && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative w-full h-64 group"
              >
                {isVideo ? (
                  <video
                    src={mediaPreview}
                    className="w-full h-full object-cover rounded-xl ring-2 ring-violet-200"
                    controls
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="preview"
                    className="w-full h-full object-cover rounded-xl ring-2 ring-violet-200"
                  />
                )}
                <button
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                {file && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs p-2 rounded-lg">
                    {file.name} ({formatFileSize(file.size)})
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-gray-500 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => fileRef.current.click()}
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 transition-all duration-300"
              disabled={loading}
            >
              {file?.type.startsWith('video/') ? (
                <Film className="mr-2 h-4 w-4" />
              ) : (
                <ImagePlus className="mr-2 h-4 w-4" />
              )}
              Add Media
            </Button>

            <Button
              onClick={createPostHandler}
              disabled={loading || (!caption.trim() && !mediaPreview)}
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Share Post'
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Supported formats: Images (JPEG, PNG, GIF) and Videos (MP4, WebM) up to 100MB</span>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={fileChangeHandler}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;