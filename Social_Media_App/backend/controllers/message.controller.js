import { Conversation } from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { Flag } from "../models/flag.model.js";
import { encryptText, decryptText } from "../utils/encryption.js";
import axios from "axios";

const analyzeText = async (message) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8080/classify/text-predict",
      {
        user: message,
      }
    );
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.log("Error in text classification:", error);
    return null;
  }
};

const updateUserFlag = async (
  senderId,
  responseClassification,
  decodedTerms
) => {
  try {
    const user = await User.findById(senderId);

    // Extract the keys from decoded_terms as the flagged words
    const newFlaggedWords = Object.keys(decodedTerms);
    console.log(newFlaggedWords)

    if (!user.flagged) {
      const newFlag = await Flag.create({
        flaggedWords: newFlaggedWords,
        positiveCount: responseClassification === "positive" ? 1 : 0,
        negativeCount: responseClassification === "coded" ? 1 : 0,
      });

      await User.findByIdAndUpdate(senderId, {
        flagged: newFlag._id,
        isFlag: responseClassification === "negative",
        flagAddedAt: responseClassification === "negative" ? new Date() : null,
      });
    } else {
      const existingFlag = await Flag.findById(user.flagged);

      // Append new flagged words to the existing array
      existingFlag.flaggedWords.push(...newFlaggedWords);

      if (responseClassification === "positive") {
        existingFlag.positiveCount += 1;
      } else if (responseClassification === "coded") {
        existingFlag.negativeCount += 1;
      }

      await existingFlag.save();

      await User.findByIdAndUpdate(senderId, {
        isFlag: responseClassification === "negative",
        flagAddedAt: responseClassification === "negative" ? new Date() : null,
      });
    }
  } catch (error) {
    console.log("Error updating user flag:", error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message } = req.body;

    // Encrypt message and prepare conversation
    let encryptedMessage = message;
    //if (responseClassification === "negative") {
    encryptedMessage = encryptText(message);
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: encryptedMessage,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await conversation.save();

    const decryptedMessage = {
      ...newMessage.toObject(),
      message: decryptText(newMessage.message),
    };

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", decryptedMessage);
    }

    res.status(201).json({
      success: true,
      newMessage: decryptedMessage,
    });

    // Handle text classification in the background
    const refinedResponse = await analyzeText(message);
    if (refinedResponse) {
      const responseClassification =
        refinedResponse.classification[0].classification;
      const decodedTerms = refinedResponse.classification[0].decoded_terms;

      // Update user's flag asynchronously
      await updateUserFlag(senderId, responseClassification, decodedTerms);
    }
  } catch (error) {
    console.log("Error in sendMessage:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation)
      return res.status(200).json({ success: true, messages: [] });

    const decryptedMessages = conversation.messages.map((msg) => ({
      ...msg.toObject(),
      message: decryptText(msg.message),
    }));

    return res.status(200).json({
      success: true,
      messages: decryptedMessages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};