import Mascot from "@/components/Mascot";
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="hidden md:block py-12 bg-slate-900 dark:bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Mascot size="sm" animate={false} className="w-10 h-10" />
              <span className="font-extrabold text-xl">Sport Streak Academy</span>
            </div>
            <p className="text-slate-300 text-sm">
              Level up your sports skills with fun, gamified training drills you can do anywhere.
            </p>
          </div>

          {/* Sports */}
          <div>
            <h4 className="font-bold mb-4 text-white">Sports</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Football</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Basketball</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tennis</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Golf</a></li>
              <li><a href="#" className="hover:text-white transition-colors">View All →</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="/legal/privacy-policy.html" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/legal/terms-of-service.html" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/legal/account-deletion.html" className="hover:text-white transition-colors">Account Deletion</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-300 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-400 fill-current" /> for athletes everywhere
          </p>
          <p className="text-sm text-slate-300">
            © 2026 Sport Streak Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
