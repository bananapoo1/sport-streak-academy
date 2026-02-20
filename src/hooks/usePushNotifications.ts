import { useState, useEffect, useCallback } from "react";
import { Capacitor, type PermissionState } from "@capacitor/core";
import { PushNotifications, type ActionPerformed, type PushNotificationSchema, type Token } from "@capacitor/push-notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | PermissionState>("default");
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  const persistToken = useCallback((token: string) => {
    setDeviceToken(token);
    localStorage.setItem("ssa.push.deviceToken", token);
    if (import.meta.env.DEV) {
      console.info("[Push] Device token:", token);
    }
  }, []);

  const handleNativePushReceived = useCallback((notification: PushNotificationSchema) => {
    if (import.meta.env.DEV) {
      console.info("[Push] Notification received:", notification);
    }
  }, []);

  const handleNativePushAction = useCallback((action: ActionPerformed) => {
    const maybeLink = action.notification.data?.deepLink ?? action.notification.data?.url;
    if (typeof maybeLink === "string") {
      const normalized = maybeLink.startsWith("sportstreak://")
        ? maybeLink.replace("sportstreak://", "/")
        : maybeLink;
      window.location.assign(normalized.startsWith("/") ? normalized : `/${normalized}`);
    }
  }, []);

  useEffect(() => {
    if (isNative) {
      setIsSupported(true);

      let isMounted = true;
      let removeListeners = () => { /* no-op */ };

      const setupNative = async () => {
        try {
          const status = await PushNotifications.checkPermissions();
          if (isMounted) {
            setPermission(status.receive);
            setIsSubscribed(status.receive === "granted");
          }

          const registrationListener = await PushNotifications.addListener("registration", (token: Token) => {
            persistToken(token.value);
            setIsSubscribed(true);
          });

          const registrationErrorListener = await PushNotifications.addListener("registrationError", (error) => {
            console.error("[Push] Native registration error:", error);
            toast({
              title: "Push setup failed",
              description: "Could not register device for notifications.",
              variant: "destructive",
            });
          });

          const receivedListener = await PushNotifications.addListener("pushNotificationReceived", handleNativePushReceived);
          const actionListener = await PushNotifications.addListener("pushNotificationActionPerformed", handleNativePushAction);

          removeListeners = () => {
            registrationListener.remove();
            registrationErrorListener.remove();
            receivedListener.remove();
            actionListener.remove();
          };
        } catch (error) {
          console.error("[Push] Native listener setup failed:", error);
        }
      };

      setupNative();

      return () => {
        isMounted = false;
        removeListeners();
        PushNotifications.removeAllListeners().catch(() => {
          // ignore cleanup errors
        });
      };
    }

    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      registerServiceWorker();
    }
  }, [handleNativePushAction, handleNativePushReceived, isNative, persistToken, toast]);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      if (import.meta.env.DEV) {
        console.info("[Push] Service worker registered:", reg);
      }
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
      if (isNative) {
        const result = await PushNotifications.requestPermissions();
        setPermission(result.receive);

        if (result.receive === "granted") {
          toast({
            title: "Notifications Enabled",
            description: "Native push notifications are enabled.",
          });
          return true;
        }

        toast({
          title: "Notifications Blocked",
          description: "Enable notifications in device settings.",
          variant: "destructive",
        });
        return false;
      }

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
  }, [isNative, isSupported, toast]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      if (permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      if (isNative) {
        await PushNotifications.register();
        setIsSubscribed(true);
        return true;
      }

      if (!registration) return false;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
        ) as BufferSource,
      });

      if (import.meta.env.DEV) {
        console.info("[Push] Subscription successful:", subscription);
      }
      setIsSubscribed(true);

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
  }, [isNative, permission, registration, requestPermission, user, toast]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      if (isNative) {
        await PushNotifications.unregister();
        setIsSubscribed(false);
        toast({
          title: "Notifications Disabled",
          description: "Native push notifications disabled for this app.",
        });
        return true;
      }

      if (!registration) return false;

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
  }, [isNative, registration, toast]);

  const sendLocalNotification = useCallback((title: string, body: string, data?: unknown) => {
    if (permission !== "granted") return;

    if (isNative) {
      toast({
        title,
        description: body,
      });
      return;
    }

    registration?.showNotification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "local-notification",
      data: { ...(typeof data === "object" && data ? data as Record<string, unknown> : {}), deepLink: "sportstreak://drills" },
    });
  }, [isNative, registration, permission, toast]);

  const scheduleStreakReminder = useCallback(async (hour: number, minute: number) => {
    if (isNative) {
      // Native scheduling should be done server-side via FCM/APNs once tokens are stored.
      return;
    }

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

    if (import.meta.env.DEV) {
      console.info(`[Push] Streak reminder scheduled for ${reminderTime.toLocaleTimeString()}`);
    }
  }, [isNative, registration, permission, sendLocalNotification]);

  return {
    isSupported,
    isSubscribed,
    permission,
    deviceToken,
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
