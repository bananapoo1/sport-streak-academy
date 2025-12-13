import Mascot from "@/components/Mascot";
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Mascot size="sm" animate={false} className="w-10 h-10" />
              <span className="font-extrabold text-xl">DrillZone</span>
            </div>
            <p className="text-background/70 text-sm">
              Level up your sports skills with fun, gamified training drills you can do anywhere.
            </p>
          </div>

          {/* Sports */}
          <div>
            <h4 className="font-bold mb-4">Sports</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">Football</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Basketball</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Tennis</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Golf</a></li>
              <li><a href="#" className="hover:text-background transition-colors">View All →</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/70 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-current" /> for athletes everywhere
          </p>
          <p className="text-sm text-background/70">
            © 2024 DrillZone. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
