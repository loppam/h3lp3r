import { Share } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SocialShareProps {
  campaignCode: string;
}

export function SocialShare({ campaignCode }: SocialShareProps) {
  const shareUrl = `${window.location.origin}/campaigns/${campaignCode}`;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        window.open(
          `https://twitter.com/intent/tweet?text=Check out this campaign!&url=${encodeURIComponent(
            shareUrl
          )}`,
          "_blank"
        );
      }}
    >
      <Share className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
}
