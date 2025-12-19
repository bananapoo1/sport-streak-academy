import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Trophy, Target, Flame, Lock, Crown } from "lucide-react";
import LevelMap from "@/components/LevelMap";
import CategoryMap from "@/components/CategoryMap";
import { useCompletedDrills } from "@/hooks/useCompletedDrills";
import { getSportData } from "@/data/drillsData";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const SportDetail = () => {
  const { sportSlug } = useParams();
  const { completedDrills, loading } = useCompletedDrills(sportSlug);
  const { isPro, isSingleSport, subscribed, loading: subLoading } = useSubscription();
  const { user } = useAuth();
  
  const sportData = getSportData(sportSlug || "");
  const completedDrillIds = new Set(completedDrills.map(d => d.drill_id));
  
  const totalDrills = sportData.drills.length;
  const completedCount = completedDrills.length;
  const totalXP = sportData.drills.reduce((sum, d) => sum + d.xp, 0);
  const earnedXP = sportData.drills
    .filter(d => completedDrillIds.has(d.id))
    .reduce((sum, d) => sum + d.xp, 0);
  const bossLevels = sportData.drills.filter(d => d.isBoss).length;
  const bossCompleted = sportData.drills.filter(d => d.isBoss && completedDrillIds.has(d.id)).length;

  // Check if user has paid access
  const hasPaidAccess = isPro || isSingleSport;
  const hasCategories = sportData.categories && sportData.categories.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/sports" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Sports
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-5xl font-extrabold mb-2"
              style={{ color: sportData.color }}
            >
              {sportData.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {hasPaidAccess && hasCategories 
                ? "Choose a skill category to focus your training"
                : "Master your skills through progressive training levels"
              }
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{completedCount}/{totalDrills}</p>
              <p className="text-xs text-muted-foreground">Levels Done</p>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-xp" />
              <p className="text-2xl font-bold text-foreground">{earnedXP}</p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold text-foreground">{bossCompleted}/{bossLevels}</p>
              <p className="text-xs text-muted-foreground">Boss Levels</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-bold text-foreground">{Math.round((completedCount / totalDrills) * 100)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(completedCount / totalDrills) * 100}%`,
                  backgroundColor: sportData.color 
                }}
              />
            </div>
          </div>

          {/* Paid users get category view, free users get linear view */}
          {loading || subLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your progress...</p>
            </div>
          ) : hasPaidAccess && hasCategories ? (
            // Category-based view for paid users
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-4 flex items-center gap-3">
                <Crown className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-bold text-foreground">Pro Training Mode</p>
                  <p className="text-sm text-muted-foreground">Train specific skills with categorized drills</p>
                </div>
              </div>
              
              <CategoryMap 
                categories={sportData.categories!}
                sportSlug={sportSlug || ""}
                completedDrillIds={completedDrillIds}
                sportColor={sportData.color}
              />
            </div>
          ) : (
            // Linear level-based view for free users
            <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-soft">
              <h2 className="text-xl font-bold text-foreground mb-2 text-center">Training Journey</h2>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Complete each level to unlock the next. Boss levels appear every 10 drills!
              </p>
              
              {/* Upgrade prompt for free users */}
              {user && !hasPaidAccess && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-400/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="w-5 h-5 text-amber-500" />
                    <p className="font-bold text-foreground">Unlock Skill Categories</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upgrade to Pro to train specific skills like dribbling, passing, and shooting separately!
                  </p>
                  <Link to="/#pricing">
                    <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                      View Plans
                    </Button>
                  </Link>
                </div>
              )}
              
              <LevelMap 
                drills={sportData.drills}
                sportSlug={sportSlug || ""}
                completedDrillIds={completedDrillIds}
                sportColor={sportData.color}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SportDetail;
