import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { encryptText, decryptText } from "../utils/encryption.js";
import fs from "fs";
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const file = req.file;
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!file && !caption) {
      return res.status(400).json({
        success: false,
        message: "Please provide either a caption or media file",
      });
    }

    let mediaUrl = "";
    let mediaType = "";

    if (file) {
      try {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "video/mp4",
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          await unlinkAsync(file.path);
          return res.status(400).json({
            success: false,
            message: "Invalid file type. Only JPEG, PNG, and MP4 are allowed",
          });
        }

        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "posts",
          transformation: file.mimetype.startsWith("image")
            ? [{ width: 1080, height: 1080, crop: "limit" }]
            : undefined,
        });

        mediaUrl = result.secure_url;
        mediaType = result.resource_type;

        await unlinkAsync(file.path);
      } catch (uploadError) {
        if (file && fs.existsSync(file.path)) {
          await unlinkAsync(file.path);
        }
        return res.status(500).json({
          success: false,
          message: `Upload failed: ${uploadError.message}`,
        });
      }
    }

    const postData = {
      caption,
      author: userId,
      ...(mediaUrl && {
        [mediaType === "video" ? "video" : "image"]: mediaUrl,
        mediaType,
      }),
    };

    // Create the post
    const post = await Post.create(postData);

    // Update user's posts array
    await User.findByIdAndUpdate(
      userId,
      { $push: { posts: post._id } },
      { new: true }
    );

    // Fetch the populated post
    const populatedPost = await Post.findById(post._id)
      .populate("author", "username name profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username name profilePicture",
        },
      });

    // Fetch updated user data to ensure post count is correct
    const updatedUser = await User.findById(userId)
      .populate("posts")
      .populate("followers")
      .populate("following")
      .populate("bookmarks");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in addNewPost:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      await unlinkAsync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create post",
    });
  }
};

// Add this function to get user profile with posts
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("posts")
      .populate("followers")
      .populate("following")
      .populate("bookmarks");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user profile",
    });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePicture")
      .populate("comments.author", "username profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate("author", "username profilePicture")
      .populate("comments.author", "username profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneWalaUserKiId = req.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Text is required",
        success: false,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Encrypt the comment text before saving
    const encryptedText = encryptText(text);

    const comment = await Comment.create({
      text: encryptedText,
      author: commentKrneWalaUserKiId,
      post: postId,
    });

    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });

    post.comments.push(comment._id);
    await post.save();

    // Send the original text in response
    const commentResponse = {
      ...comment.toObject(),
      text: text, // Original text, not encrypted
    };

    return res.status(201).json({
      message: "Comment Added",
      comment: commentResponse,
      success: true,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });

    if (!comments || comments.length === 0) {
      return res.status(404).json({
        message: "No comments found",
        success: false,
      });
    }

    // Decrypt all comments
    const decryptedComments = comments.map((comment) => {
      const commentObj = comment.toObject();
      try {
        return {
          ...commentObj,
          text: decryptText(commentObj.text),
        };
      } catch (error) {
        console.error("Error decrypting comment:", error);
        return {
          ...commentObj,
          text: "Error decrypting comment",
        };
      }
    });

    return res.status(200).json({
      comments: decryptedComments,
      success: true,
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
    await post.save();

    const user = await User.findById(likeKrneWalaUserKiId).select(
      "username profilePicture likeHistory"
    );
    user.likeHistory.push(postId);
    await user.save();

    const postOwnerId = post.author.toString();

    if (postOwnerId !== likeKrneWalaUserKiId) {
      const notification = {
        type: "like",
        userId: likeKrneWalaUserKiId,
        userDetails: {
          username: user.username,
          profilePicture: user.profilePicture,
        },
        postId,
        message: "Your post was liked",
      };
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("notification", notification);
    }

    return res.status(200).json({ message: "Post liked", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const dislikePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
    await post.save();

    const user = await User.findById(likeKrneWalaUserKiId).select(
      "username profilePicture"
    );
    const postOwnerId = post.author.toString();

    if (postOwnerId !== likeKrneWalaUserKiId) {
      const notification = {
        type: "dislike",
        userId: likeKrneWalaUserKiId,
        userDetails: user,
        postId,
        message: "Your post was unliked",
      };
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("notification", notification);
    }

    return res.status(200).json({ message: "Post disliked", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    if (post.author.toString() !== authorId) {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    await Post.findByIdAndDelete(postId);

    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmark",
        success: true,
      });
    } else {
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        type: "saved",
        message: "Post bookmarked",
        success: true,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
