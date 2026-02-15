import Navbar from "@/components/Navbar";
import HomeProgress from "@/components/HomeProgress";
import SportsSection from "@/components/SportsSection";
import DrillsSection from "@/components/DrillsSection";
import LeaguesSection from "@/components/LeaguesSection";
import PricingSection from "@/components/PricingSection";
import AchievementsSection from "@/components/AchievementsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pb-0">
        <HomeProgress />
        <SportsSection />
        <DrillsSection />
        <LeaguesSection />
        <AchievementsSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
