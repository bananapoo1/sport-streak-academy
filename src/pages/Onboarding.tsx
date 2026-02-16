import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/services/analytics";
import { sportsData } from "@/data/drillsData";
import { Dumbbell, Target, Bell, Star, Shield, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ONBOARDING_STORAGE_KEY = "onboarding_v2_complete";
const ONBOARDING_DATA_KEY = "onboarding_v2_data";
const ONBOARDING_SYNC_KEY = "onboarding_v2_synced";

const skillOptions = [
  { id: "beginner", label: "Beginner", description: "New to structured training" },
  { id: "intermediate", label: "Intermediate", description: "Train regularly and want progress" },
  { id: "advanced", label: "Advanced", description: "Chasing high-level improvement" },
];

const focusOptions = [
  { id: "technique", label: "Technique", icon: Target },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "tactics", label: "Tactics", icon: Shield },
  { id: "mentality", label: "Mentality", icon: Trophy },
];

const goalOptions = [
  { id: "pro", label: "Become Pro" },
  { id: "best-team", label: "Be the best on my team" },
  { id: "scholarship", label: "Earn a scholarship" },
  { id: "scouted", label: "Get scouted" },
];

const equipmentOptions = [
  { id: "ball", label: "Ball" },
  { id: "cones", label: "Cones" },
  { id: "wall", label: "Wall" },
  { id: "goal", label: "Goal" },
  { id: "ladder", label: "Speed ladder" },
  { id: "none", label: "No equipment" },
];

const dayOptions = [
  { id: "mon", label: "M" },
  { id: "tue", label: "T" },
  { id: "wed", label: "W" },
  { id: "thu", label: "T" },
  { id: "fri", label: "F" },
  { id: "sat", label: "S" },
  { id: "sun", label: "S" },
];

const sessionOptions = [
  { id: 10, label: "10 min" },
  { id: 15, label: "15 min" },
  { id: 20, label: "20 min" },
  { id: 30, label: "30 min" },
];

const reminderOptions = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

const stepTitles = [
  "Choose your sports",
  "Set your goal",
  "Pick your focus",
  "Choose your schedule",
  "Turn on reminders",
];

type OnboardingData = {
  sports: string[];
  primarySport: string | null;
  skillLevel: string | null;
  focus: string | null;
  goal: string | null;
  personalTag: string;
  equipment: string[];
  weeklyDays: string[];
  sessionMinutes: number;
  reminderTime: string;
  remindersEnabled: boolean;
};

const defaultData: OnboardingData = {
  sports: [],
  primarySport: null,
  skillLevel: null,
  focus: null,
  goal: null,
  personalTag: "",
  equipment: [],
  weeklyDays: ["mon", "wed", "fri"],
  sessionMinutes: 10,
  reminderTime: "evening",
  remindersEnabled: true,
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(defaultData);

  const sports = useMemo(() => Object.values(sportsData).map((sport) => ({
    id: sport.slug,
    name: sport.name,
    color: sport.color,
  })), []);

  const toggleArray = (key: keyof OnboardingData, value: string) => {
    setData((prev) => {
      const list = new Set(prev[key] as string[]);
      if (list.has(value)) list.delete(value);
      else list.add(value);

      const updated = { ...prev, [key]: Array.from(list) } as OnboardingData;
      if (key === "sports" && updated.sports.length > 0 && !updated.primarySport) {
        updated.primarySport = updated.sports[0];
      }
      if (key === "sports" && updated.primarySport && !updated.sports.includes(updated.primarySport)) {
        updated.primarySport = updated.sports[0] || null;
      }
      return updated;
    });
  };

  const setPrimarySport = (sportId: string) => {
    setData((prev) => ({ ...prev, primarySport: sportId }));
  };

  const completeStep = () => {
    const next = Math.min(step + 1, stepTitles.length - 1);
    setStep(next);
  };

  const goBack = () => {
    const prev = Math.max(0, step - 1);
    setStep(prev);
  };

  const isStepComplete = () => {
    if (step === 0) return data.sports.length > 0;
    if (step === 1) return Boolean(data.goal) && Boolean(data.skillLevel);
    if (step === 2) return Boolean(data.focus) && data.equipment.length > 0;
    if (step === 3) return data.weeklyDays.length > 0 && data.sessionMinutes > 0;
    return true;
  };

  const finish = async () => {
    const payload = {
      ...data,
      completedAtISO: new Date().toISOString(),
    };

    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(payload));

    if (user) {
      const { error } = await supabase
        .from("onboarding_responses")
        .upsert({
          user_id: user.id,
          data: payload,
          version: 1,
          source: "app",
        }, { onConflict: "user_id" });

      if (!error) {
        localStorage.setItem(ONBOARDING_SYNC_KEY, "true");
      } else {
        console.error("Failed to sync onboarding", error);
      }
    }

    trackEvent("onboarding_completed", payload, user?.id ?? "guest");
    navigate(user ? "/" : "/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 pb-24 pt-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={goBack} disabled={step === 0}>Back</Button>
          <div className="text-xs text-muted-foreground">Step {step + 1} of {stepTitles.length}</div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {stepTitles.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
          {stepTitles[step]}
        </h1>
        <p className="text-muted-foreground mb-6">
          {step === 0 && "Pick one or more sports to personalize your drills."}
          {step === 1 && "Tell us your current level and ambition."}
          {step === 2 && "We will build your plan around your focus and equipment."}
          {step === 3 && "Choose how often and how long you want to train."}
          {step === 4 && "A light nudge at the right time keeps streaks alive."}
        </p>

        {/* Step content */}
        {step === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => toggleArray("sports", sport.id)}
                className={`rounded-xl border p-3 text-left transition-colors ${data.sports.includes(sport.id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"}`}
              >
                <div className="text-sm font-semibold text-foreground">{sport.name}</div>
                <div className="text-xs text-muted-foreground">Multi-sport ready</div>
                {data.sports.includes(sport.id) && (
                  <div className="mt-2 flex items-center justify-between">
                    {data.primarySport === sport.id ? (
                      <div className="inline-flex items-center gap-1 text-xs text-primary">
                        <Star className="w-3 h-3" /> Primary
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPrimarySport(sport.id);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {skillOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`p-4 cursor-pointer transition-colors ${data.skillLevel === option.id
                    ? "border-primary bg-primary/10"
                    : "border-border"}`}
                  onClick={() => setData((prev) => ({ ...prev, skillLevel: option.id }))}
                >
                  <div className="text-sm font-semibold text-foreground">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                </Card>
              ))}
            </div>

            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Primary goal</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goalOptions.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setData((prev) => ({ ...prev, goal: goal.id }))}
                    className={`rounded-xl border p-3 text-left transition-colors ${data.goal === goal.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"}`}
                  >
                    <div className="text-sm font-semibold text-foreground">{goal.label}</div>
                    <div className="text-xs text-muted-foreground">We will tailor drills for this</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Focus today</div>
              <div className="grid grid-cols-2 gap-3">
                {focusOptions.map((focus) => {
                  const Icon = focus.icon;
                  return (
                    <button
                      key={focus.id}
                      onClick={() => setData((prev) => ({ ...prev, focus: focus.id }))}
                      className={`rounded-xl border p-4 text-left flex items-center gap-3 transition-colors ${data.focus === focus.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-sm font-semibold text-foreground">{focus.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Equipment you have</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {equipmentOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleArray("equipment", item.id)}
                    className={`rounded-xl border p-3 text-left transition-colors ${data.equipment.includes(item.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"}`}
                  >
                    <div className="text-sm font-semibold text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">Optional</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Days you want to train</div>
              <div className="flex gap-2">
                {dayOptions.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleArray("weeklyDays", day.id)}
                    className={`w-10 h-12 rounded-xl border text-sm font-bold transition-colors ${data.weeklyDays.includes(day.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground"}`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Daily session length</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sessionOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setData((prev) => ({ ...prev, sessionMinutes: option.id }))}
                    className={`rounded-xl border p-3 text-center transition-colors ${data.sessionMinutes === option.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"}`}
                  >
                    <div className="text-sm font-semibold text-foreground">{option.label}</div>
                    <div className="text-xs text-muted-foreground">Recommended</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <Card className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">Training reminders</div>
                <div className="text-xs text-muted-foreground">We only send your chosen reminders</div>
              </div>
              <Button
                size="sm"
                variant={data.remindersEnabled ? "default" : "outline"}
                onClick={() => setData((prev) => ({ ...prev, remindersEnabled: !prev.remindersEnabled }))}
              >
                {data.remindersEnabled ? "On" : "Off"}
              </Button>
            </Card>

            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Best time for reminders</div>
              <div className="grid grid-cols-3 gap-3">
                {reminderOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setData((prev) => ({ ...prev, reminderTime: option.id }))}
                    className={`rounded-xl border p-3 text-center transition-colors ${data.reminderTime === option.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"}`}
                  >
                    <div className="text-sm font-semibold text-foreground">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Add a personal tag (optional)</div>
              <Input
                placeholder="Example: Get faster for tryouts"
                value={data.personalTag}
                onChange={(event) => setData((prev) => ({ ...prev, personalTag: event.target.value }))}
              />
              <div className="text-xs text-muted-foreground mt-2">We will keep your plan focused and realistic</div>
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className="mt-10 flex gap-3">
          {step < stepTitles.length - 1 ? (
            <Button
              onClick={completeStep}
              disabled={!isStepComplete()}
              className="w-full h-12 text-base font-bold"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={finish}
              className="w-full h-12 text-base font-bold"
            >
              Finish Setup
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;