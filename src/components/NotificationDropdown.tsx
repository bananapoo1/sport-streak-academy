import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Swords, UserPlus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFriends } from "@/hooks/useFriends";
import { useChallenges } from "@/hooks/useChallenges";

export const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const { pendingRequests, acceptFriendRequest, removeFriend } = useFriends();
  const { pendingChallenges, acceptChallenge, declineChallenge } = useChallenges();

  const totalNotifications = pendingRequests.length + pendingChallenges.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="w-9 h-9 relative">
          <Bell className="w-4 h-4" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
              {totalNotifications}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {totalNotifications === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Friend Requests */}
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-3 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                      {request.avatar_id && request.avatar_id !== "default" ? request.avatar_id : "⚽"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <UserPlus className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary font-medium">Friend Request</span>
                      </div>
                      <p className="text-sm text-foreground font-medium truncate">
                        {request.username || "Unknown"} wants to be your friend
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            acceptFriendRequest(request.id);
                          }}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => removeFriend(request.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Challenge Requests */}
              {pendingChallenges.map((challenge) => (
                <div key={challenge.id} className="p-3 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-xl">
                      {challenge.challenger_avatar || "⚽"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Swords className="w-3 h-3 text-destructive" />
                        <span className="text-xs text-destructive font-medium">Challenge</span>
                      </div>
                      <p className="text-sm text-foreground font-medium truncate">
                        {challenge.challenger_name} challenges you!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{challenge.xp_bonus} XP bonus
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => acceptChallenge(challenge.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => declineChallenge(challenge.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalNotifications > 0 && (
          <div className="p-2 border-t border-border">
            <Link to="/challenges" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all challenges
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
