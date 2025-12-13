import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SportsSection from "@/components/SportsSection";
import DrillsSection from "@/components/DrillsSection";
import LeaguesSection from "@/components/LeaguesSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <SportsSection />
        <DrillsSection />
        <LeaguesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
