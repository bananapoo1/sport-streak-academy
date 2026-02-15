import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("[Push] Service worker registered:", reg);
      setRegistration(reg);

      // Check if already subscribed
      const subscription = await reg.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("[Push] Service worker registration failed:", error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive streak reminders to stay on track!",
        });
        return true;
      } else if (result === "denied") {
        toast({
          title: "Notifications Blocked",
          description: "You can enable them in your browser settings.",
          variant: "destructive",
        });
        return false;
      }
      return false;
    } catch (error) {
      console.error("[Push] Permission request failed:", error);
      return false;
    }
  }, [isSupported, toast]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!registration || !user) return false;

    try {
      // First ensure permission is granted
      if (permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // Note: In production, you'd use a VAPID key from your server
        applicationServerKey: urlBase64ToUint8Array(
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
        ) as BufferSource,
      });

      console.log("[Push] Subscription successful:", subscription);
      setIsSubscribed(true);

      // In a real app, you'd send this subscription to your server
      // await saveSubscriptionToServer(subscription);

      return true;
    } catch (error) {
      console.error("[Push] Subscription failed:", error);
      toast({
        title: "Subscription Failed",
        description: "Could not enable push notifications. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [registration, user, permission, requestPermission, toast]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!registration) return false;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        toast({
          title: "Notifications Disabled",
          description: "You won't receive streak reminders anymore.",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("[Push] Unsubscribe failed:", error);
      return false;
    }
  }, [registration, toast]);

  const sendLocalNotification = useCallback((title: string, body: string, data?: unknown) => {
    if (permission !== "granted") return;

    registration?.showNotification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "local-notification",
      data: { ...(typeof data === "object" && data ? data as Record<string, unknown> : {}), deepLink: "sportstreak://drills" },
    });
  }, [registration, permission]);

  const scheduleStreakReminder = useCallback(async (hour: number, minute: number) => {
    if (!registration || permission !== "granted") return;

    // Calculate time until reminder
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour, minute, 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();

    // For demo purposes, we'll use setTimeout
    // In production, you'd use the Push API with server-side scheduling
    setTimeout(() => {
      sendLocalNotification(
        "🔥 Streak Reminder!",
        "Time to complete your daily training and keep your streak alive!",
        { deepLink: "sportstreak://drills" }
      );
    }, delay);

    console.log(`[Push] Streak reminder scheduled for ${reminderTime.toLocaleTimeString()}`);
  }, [registration, permission, sendLocalNotification]);

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    sendLocalNotification,
    scheduleStreakReminder,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
