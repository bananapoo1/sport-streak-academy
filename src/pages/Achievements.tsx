import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AchievementsSection from "@/components/AchievementsSection";

const Achievements = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pt-24 md:pb-16">
        <AchievementsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Achievements;
