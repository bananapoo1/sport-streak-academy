import { Bell, BellOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const NotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    sendLocalNotification,
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleTestNotification = () => {
    sendLocalNotification(
      "🔥 Test Notification",
      "Push notifications are working! You'll receive streak reminders.",
      { url: "/" }
    );
  };

  if (!isSupported) {
    return (
      <div className="bg-secondary/50 rounded-xl p-4 flex items-center gap-3">
        <BellOff className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">Push Notifications</p>
          <p className="text-sm text-muted-foreground">Not supported in this browser</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-secondary/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSubscribed ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
            {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </div>
          <div>
            <Label htmlFor="push-notifications" className="font-medium text-foreground cursor-pointer">
              Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              {permission === "denied" 
                ? "Blocked in browser settings" 
                : isSubscribed 
                  ? "Receiving streak reminders" 
                  : "Get reminded to train"}
            </p>
          </div>
        </div>
        <Switch
          id="push-notifications"
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={permission === "denied"}
        />
      </div>

      {isSubscribed && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestNotification}
          className="w-full"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Send Test Notification
        </Button>
      )}

      {permission === "denied" && (
        <p className="text-xs text-muted-foreground text-center">
          To enable notifications, update your browser settings for this site.
        </p>
      )}
    </div>
  );
};

export default NotificationSettings;
