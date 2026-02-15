import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pt-24 md:pb-16">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
