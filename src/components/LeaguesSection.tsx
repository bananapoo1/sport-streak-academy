import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Users, Flame } from "lucide-react";
import LeagueBadge from "@/components/LeagueBadge";
import StreakCounter from "@/components/StreakCounter";

const leaderboard = [
  { id: "alex-m", name: "Alex M.", xp: 2450, streak: 32, avatar: "🏀" },
  { id: "sarah-k", name: "Sarah K.", xp: 2380, streak: 28, avatar: "⚽" },
  { id: "james-l", name: "James L.", xp: 2290, streak: 25, avatar: "🎾" },
  { id: "emma-r", name: "Emma R.", xp: 2150, streak: 21, avatar: "🏈" },
  { id: "you", name: "You", xp: 2100, streak: 7, avatar: "🌟", isUser: true },
];

export const LeaguesSection = () => {
  return (
    <section id="leagues" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Compete & Climb
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Earn XP from completing drills, maintain your streak, and climb through Bronze, Silver, Gold, and Diamond leagues!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* League Progress */}
          <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-card">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-league-gold" />
              Your League Progress
            </h3>

            <div className="flex flex-wrap gap-4 mb-6">
              <LeagueBadge league="gold" rank={5} />
              <StreakCounter days={7} />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">XP to Diamond</span>
                  <span className="font-bold text-foreground">2100 / 3000</span>
                </div>
                <div className="h-4 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-500"
                    style={{ width: "70%" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-success" />
                <span>You're in the top 15% this week!</span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-card">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Gold League Leaderboard
            </h3>

            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <Link
                  key={player.id}
                  to={player.isUser ? "#" : `/profile/${player.id}`}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                    player.isUser
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-secondary/50 hover:bg-secondary cursor-pointer"
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center font-bold text-foreground">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xl">
                    {player.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{player.name}</div>
                    <div className="text-sm text-muted-foreground">{player.xp} XP</div>
                  </div>
                  <div className="flex items-center gap-1 text-streak">
                    <Flame className="w-4 h-4 fill-current" />
                    <span className="font-bold text-sm">{player.streak}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaguesSection;
