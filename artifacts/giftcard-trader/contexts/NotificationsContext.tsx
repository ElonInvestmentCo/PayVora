import React, { createContext, useContext, useState, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  time: string;
  read: boolean;
  icon?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  showPanel: boolean;
  setShowPanel: (v: boolean) => void;
  togglePanel: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "read">) => void;
  clearAll: () => void;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Trade Completed", message: "Your Amazon Gift Card trade for $100 has been completed. ₦75,000 credited.", type: "success", time: "2 min ago", read: false, icon: "check-circle" },
  { id: "n2", title: "Price Alert", message: "USD/NGN rate has increased by 2.3% today. Great time to sell!", type: "info", time: "15 min ago", read: false, icon: "trending-up" },
  { id: "n3", title: "KYC Update", message: "Your KYC verification is under review. We'll notify you once complete.", type: "warning", time: "1 hour ago", read: false, icon: "shield" },
  { id: "n4", title: "Security Alert", message: "New login detected from Chrome on Windows. If this wasn't you, secure your account.", type: "error", time: "3 hours ago", read: true, icon: "alert-triangle" },
  { id: "n5", title: "Deposit Received", message: "₦50,000 has been credited to your wallet from bank transfer.", type: "success", time: "Yesterday", read: true, icon: "download" },
];

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  showPanel: false,
  setShowPanel: () => {},
  togglePanel: () => {},
  markRead: () => {},
  markAllRead: () => {},
  addNotification: () => {},
  clearAll: () => {},
});

let nextId = 100;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [showPanel, setShowPanel] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const togglePanel = useCallback(() => setShowPanel((p) => !p), []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, "id" | "read">) => {
    setNotifications((prev) => [{ ...n, id: `n${nextId++}`, read: false }, ...prev]);
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, showPanel, setShowPanel, togglePanel, markRead, markAllRead, addNotification, clearAll }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
