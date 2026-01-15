import CryptoJS from "crypto-js";

const SECRET_KEY = "GEXTON_SECURE_KEY_2025";

export const secureSet = (key, value, expiryMs = null) => {
  const payload = {
    value,
    expiry: expiryMs ? Date.now() + expiryMs : null,
  };

  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    SECRET_KEY
  ).toString();

  localStorage.setItem(key, encrypted);
};

export const secureGet = (key) => {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (decrypted.expiry && Date.now() > decrypted.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return decrypted.value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const secureRemove = (key) => {
  localStorage.removeItem(key);
};
