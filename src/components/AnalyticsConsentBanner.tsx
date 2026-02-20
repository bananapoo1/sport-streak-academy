import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasConsentDecision, setConsentStatus } from "@/services/consent";

const AnalyticsConsentBanner = () => {
  const [visible, setVisible] = useState(!hasConsentDecision());

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-md">
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground">
            We use analytics to improve training quality and app reliability. You can change this later in settings.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setConsentStatus("granted");
                setVisible(false);
              }}
            >
              Allow analytics
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setConsentStatus("denied");
                setVisible(false);
              }}
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsConsentBanner;
