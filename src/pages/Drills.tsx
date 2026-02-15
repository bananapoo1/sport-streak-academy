import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DrillsSection from "@/components/DrillsSection";
import MobileQuickActions from "@/components/MobileQuickActions";
import TabSkeleton from "@/components/TabSkeleton";

const Drills = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pt-24 md:pb-16">
        <MobileQuickActions />
        {loading ? <TabSkeleton /> : <DrillsSection />}
      </main>
      <Footer />
    </div>
  );
};

export default Drills;
