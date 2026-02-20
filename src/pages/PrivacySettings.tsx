import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { clearTrackedEvents } from "@/services/analytics";
import { getConsentStatus, setConsentStatus } from "@/services/consent";

const PrivacySettings = () => {
  const { toast } = useToast();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    setAnalyticsEnabled(getConsentStatus() === "granted");
  }, []);

  const handleAnalyticsToggle = (checked: boolean) => {
    setAnalyticsEnabled(checked);
    setConsentStatus(checked ? "granted" : "denied");

    toast({
      title: "Privacy preference saved",
      description: checked
        ? "Analytics is now enabled."
        : "Analytics is now disabled.",
    });
  };

  const clearAnalyticsData = () => {
    clearTrackedEvents();
    toast({
      title: "Analytics data cleared",
      description: "Stored analytics events were removed from this device.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-extrabold text-foreground">Privacy Settings</h1>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1">
                  <h2 className="font-semibold text-foreground">Analytics</h2>
                  <p className="text-sm text-muted-foreground">
                    Help improve app quality by sharing anonymous usage events.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics-consent">Allow analytics</Label>
                  <Switch
                    id="analytics-consent"
                    checked={analyticsEnabled}
                    onCheckedChange={handleAnalyticsToggle}
                  />
                </div>

                <Button variant="outline" className="w-full" onClick={clearAnalyticsData}>
                  Clear local analytics data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <h2 className="font-semibold text-foreground">Legal</h2>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><a href="/legal/privacy-policy.html" className="text-primary">Privacy Policy</a></p>
                  <p><a href="/legal/terms-of-service.html" className="text-primary">Terms of Service</a></p>
                  <p><a href="/legal/account-deletion.html" className="text-primary">Account Deletion</a></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacySettings;
