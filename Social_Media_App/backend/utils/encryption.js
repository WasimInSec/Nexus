import CryptoJS from "crypto-js";

const ENCRYPTION_PREFIX = "ENC:"; // Changed prefix to be consistent
const ENCRYPTION_KEY =
  "8d855edef453ed6d7ee03d096de91d88345c604347da8f7fd81ed6d4b7b0009b";

export const encryptText = (text) => {
  const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  return `${ENCRYPTION_PREFIX}${encrypted}`; // Add prefix to encrypted text
};

export const decryptText = (text) => {
  if (!text || typeof text !== "string") {
    return text;
  }

  if (!text.startsWith(ENCRYPTION_PREFIX)) {
    return text; // Return original text if not encrypted
  }

  try {
    const encryptedText = text.slice(ENCRYPTION_PREFIX.length);
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // Additional validation to ensure decryption was successful
    if (!decrypted) {
      return text;
    }

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return text; // Return original text if decryption fails
  }
};