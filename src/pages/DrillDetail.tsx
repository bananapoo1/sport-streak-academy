import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, CheckCircle, Clock, Users, Zap, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

// Drill data with video URLs and instructions
const drillData: Record<string, Record<string, { title: string; duration: string; difficulty: string; players: string; xp: number; videoUrl: string; instructions: string[] }>> = {
  football: {
    "dribbling-cone-slalom": {
      title: "Dribbling Cone Slalom",
      duration: "10 min",
      difficulty: "Beginner",
      players: "Solo",
      xp: 50,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      instructions: [
        "Set up 5-8 cones in a straight line, spaced about 1 meter apart",
        "Start at one end with the ball at your feet",
        "Dribble through the cones using the inside and outside of your feet",
        "Keep the ball close to your body and your head up",
        "Focus on quick, controlled touches",
        "Turn around at the end and dribble back",
        "Repeat for 10 minutes, trying to improve speed while maintaining control",
      ],
    },
    "wall-pass-accuracy": {
      title: "Wall Pass Accuracy",
      duration: "15 min",
      difficulty: "Intermediate",
      players: "Solo",
      xp: 75,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      instructions: [
        "Find a solid wall without windows or obstacles",
        "Mark a target area on the wall (use tape if possible)",
        "Stand 3-5 meters from the wall",
        "Pass the ball with your right foot to the target",
        "Control the return and pass again with your left foot",
        "Increase distance as accuracy improves",
        "Track your hit percentage and try to beat your record",
      ],
    },
    "juggling-mastery": {
      title: "Juggling Mastery",
      duration: "12 min",
      difficulty: "Beginner",
      players: "Solo",
      xp: 60,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      instructions: [
        "Start with the ball in your hands",
        "Drop the ball and kick it back up to your hands",
        "Practice with both feet alternately",
        "Once comfortable, try two touches before catching",
        "Progress to continuous juggling without catching",
        "Set a goal: start with 10, work up to 50+ touches",
      ],
    },
  },
  basketball: {
    "free-throw-challenge": {
      title: "Free Throw Challenge",
      duration: "10 min",
      difficulty: "Beginner",
      players: "Solo",
      xp: 50,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      instructions: [
        "Stand at the free-throw line with proper stance",
        "Bend knees slightly, feet shoulder-width apart",
        "Hold the ball with your shooting hand under and guide hand on the side",
        "Focus on the front of the rim",
        "Extend your arm and snap your wrist on release",
        "Follow through with your arm pointing at the basket",
        "Shoot 50 free throws and track your percentage",
      ],
    },
    "advanced-ball-handling": {
      title: "Advanced Ball Handling",
      duration: "20 min",
      difficulty: "Advanced",
      players: "Solo",
      xp: 100,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      instructions: [
        "Start with basic stationary dribbles to warm up",
        "Practice crossovers: right to left, left to right",
        "Add between-the-legs dribbles",
        "Include behind-the-back moves",
        "Combine moves into combos: crossover + between legs",
        "Practice at game speed, imagining defenders",
        "Do each combo for 2 minutes, then switch",
      ],
    },
  },
  tennis: {
    "serve-return": {
      title: "Serve & Return Practice",
      duration: "15 min",
      difficulty: "Intermediate",
      players: "2 Players",
      xp: 80,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      instructions: [
        "One player serves from the baseline",
        "Partner stands in ready position to return",
        "Server varies placement: wide, body, T",
        "Returner focuses on getting racket back early",
        "Switch roles every 10 serves",
        "Track successful returns vs errors",
      ],
    },
  },
};

const defaultDrill = {
  title: "Skill Drill",
  duration: "15 min",
  difficulty: "Intermediate",
  players: "Solo",
  xp: 75,
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  instructions: [
    "Warm up for 2-3 minutes with light movement",
    "Practice the fundamental technique slowly",
    "Gradually increase speed as form improves",
    "Take short breaks if needed",
    "Cool down and stretch after completing",
  ],
};

const DrillDetail = () => {
  const { sportSlug, drillId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const drill = drillData[sportSlug || ""]?.[drillId || ""] || defaultDrill;
  const sportName = sportSlug?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Sport";

  const handleCompleteDrill = () => {
    setIsCompleted(true);
    toast.success(`Drill completed! +${drill.xp} XP earned! 🎉`, {
      description: "Keep up the great work to maintain your streak!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            to={`/sports/${sportSlug}`} 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {sportName}
          </Link>

          {/* Drill Header */}
          <div className="mb-6">
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">
              {sportName}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2 mb-4">
              {drill.title}
            </h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                {drill.duration}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5" />
                {drill.players}
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Zap className="w-5 h-5" />
                {drill.difficulty}
              </div>
              <div className="flex items-center gap-2 text-xp">
                <Trophy className="w-5 h-5" />
                +{drill.xp} XP
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="relative bg-card border-2 border-border rounded-2xl overflow-hidden mb-6 shadow-card">
            <div className="aspect-video">
              <iframe
                src={drill.videoUrl}
                title={drill.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Instructions Collapsible */}
          <div className="bg-card border-2 border-border rounded-2xl overflow-hidden mb-6 shadow-soft">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
            >
              <h2 className="text-xl font-bold text-foreground">Step-by-Step Instructions</h2>
              {showInstructions ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            {showInstructions && (
              <div className="px-4 pb-4">
                <ol className="space-y-3">
                  {drill.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <p className="text-foreground pt-1">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Complete Button */}
          {!isCompleted ? (
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full"
              onClick={handleCompleteDrill}
            >
              <CheckCircle className="w-5 h-5" />
              Mark as Complete (+{drill.xp} XP)
            </Button>
          ) : (
            <div className="bg-success/10 border-2 border-success rounded-2xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-xl font-bold text-foreground mb-2">Drill Completed!</h3>
              <p className="text-muted-foreground mb-4">You earned {drill.xp} XP. Great work!</p>
              <Link to={`/sports/${sportSlug}`}>
                <Button variant="outline">Try Another Drill</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DrillDetail;
