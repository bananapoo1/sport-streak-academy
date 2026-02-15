import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEFAULT_TAB_STORAGE_KEY, MOBILE_TABS } from "@/lib/mobileNav";

const DefaultTabOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("/");

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 768) return;
    const existing = localStorage.getItem(DEFAULT_TAB_STORAGE_KEY);
    if (!existing) {
      setOpen(true);
    }
  }, []);

  const savePreference = () => {
    localStorage.setItem(DEFAULT_TAB_STORAGE_KEY, selectedTab);
    setOpen(false);

    if (location.pathname === "/" && selectedTab !== "/") {
      navigate(selectedTab, { replace: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Choose your default tab</DialogTitle>
          <DialogDescription>
            We&apos;ll open this tab first to make the app feel faster each time.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {MOBILE_TABS.map((tab) => (
            <Button
              key={tab.href}
              variant={selectedTab === tab.href ? "default" : "outline"}
              onClick={() => setSelectedTab(tab.href)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={savePreference} className="w-full">Save default tab</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DefaultTabOnboarding;
