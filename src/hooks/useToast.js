// hooks/useToast.js
import { useState, useEffect } from "react";

let id = 0;
const listeners = [];
let currentToasts = [];

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    listeners.push(setToasts);
    setToasts(currentToasts);

    return () => {
      const index = listeners.indexOf(setToasts);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const addToast = (options) => {
    const newToast = { ...options, id: String(id++) };
    currentToasts = [...currentToasts, newToast];
    listeners.forEach((l) => l(currentToasts));
  };

  const removeToast = (id) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(currentToasts));
  };

  return { toasts, addToast, removeToast };
};