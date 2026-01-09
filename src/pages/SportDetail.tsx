import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Trophy, Target, Flame, Lock, Crown, Zap, TreeDeciduous, LayoutList } from "lucide-react";
import LevelMap from "@/components/LevelMap";
import CategoryMap from "@/components/CategoryMap";
import SkillTree from "@/components/SkillTree";
import { useCompletedDrills } from "@/hooks/useCompletedDrills";
import { getSportData, getAllDrillsForSport } from "@/data/drillsData";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SportDetail = () => {
  const { sportSlug } = useParams();
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");
  const { completedDrills, loading } = useCompletedDrills(sportSlug);
  const { isPro, isSingleSport, loading: subLoading } = useSubscription();
  const { user } = useAuth();
  
  const sportData = getSportData(sportSlug || "");
  const allDrills = getAllDrillsForSport(sportSlug || "");
  const completedDrillIds = new Set(completedDrills.map(d => d.drill_id));
  
  if (!sportData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Sport Not Found</h1>
            <Link to="/sports">
              <Button variant="outline">Back to Sports</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Get level 1 drills for stats (base drills)
  const baseDrills = allDrills.filter(d => d.level === 1);
  const completedCount = completedDrills.length;
  const totalDrills = baseDrills.length;
  const totalXP = baseDrills.reduce((sum, d) => sum + d.xp, 0);
  const earnedXP = allDrills
    .filter(d => completedDrillIds.has(d.id))
    .reduce((sum, d) => sum + d.xp, 0);

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
            <div className="flex items-center gap-4 mb-2">
              <span className="text-5xl">{sportData.emoji}</span>
              <div>
                <h1 
                  className="text-4xl md:text-5xl font-extrabold"
                  style={{ color: sportData.color }}
                >
                  {sportData.name}
                </h1>
                <p className="text-muted-foreground">
                  {hasPaidAccess && hasCategories 
                    ? "Choose a skill category to focus your training"
                    : "Master your skills through progressive training levels"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center hover:border-primary/50 transition-colors">
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Drills Done</p>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center hover:border-xp/50 transition-colors">
              <Flame className="w-6 h-6 mx-auto mb-2 text-xp" />
              <p className="text-2xl font-bold text-foreground">{earnedXP}</p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center hover:border-streak/50 transition-colors">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-streak" />
              <p className="text-2xl font-bold text-foreground">{sportData.categories.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-bold text-foreground">
                {totalDrills > 0 ? Math.round((completedCount / totalDrills) * 100) : 0}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalDrills > 0 ? (completedCount / totalDrills) * 100 : 0}%`,
                  backgroundColor: sportData.color 
                }}
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-6">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "tree")} className="w-full max-w-xs">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list" className="gap-2">
                  <LayoutList className="w-4 h-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="tree" className="gap-2">
                  <TreeDeciduous className="w-4 h-4" />
                  Skill Tree
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading || subLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your progress...</p>
            </div>
          ) : viewMode === "tree" ? (
            <SkillTree 
              sportSlug={sportSlug || ""} 
              completedDrillIds={Array.from(completedDrillIds)} 
            />
          ) : hasPaidAccess && hasCategories ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-4 flex items-center gap-3">
                <Crown className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-bold text-foreground">Pro Training Mode</p>
                  <p className="text-sm text-muted-foreground">Train specific skills with categorized drills</p>
                </div>
              </div>
              
              <CategoryMap 
                categories={sportData.categories}
                sportSlug={sportSlug || ""}
                completedDrillIds={completedDrillIds}
                sportColor={sportData.color}
              />
            </div>
          ) : (
            <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-foreground mb-2 text-center">Training Journey</h2>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Complete each level to unlock the next. Progress through all 5 levels per drill!
              </p>
              
              {user && !hasPaidAccess && (
                <div className="mb-6 p-4 bg-gradient-to-r from-streak/10 to-streak/5 border-2 border-streak/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="w-5 h-5 text-streak" />
                    <p className="font-bold text-foreground">Unlock Skill Categories</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upgrade to Pro to train specific skills like dribbling, passing, and shooting separately!
                  </p>
                  <Link to="/#pricing">
                    <Button size="sm" className="bg-gradient-to-r from-streak to-streak/80 hover:from-streak/90 hover:to-streak/70">
                      View Plans
                    </Button>
                  </Link>
                </div>
              )}
              
              <LevelMap 
                drills={baseDrills}
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
