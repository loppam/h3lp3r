import { Button } from "@/components/ui/Button";
import { Share2, Twitter, Facebook, Link } from "lucide-react";

interface SocialShareProps {
  campaignCode: string;
  title?: string;
}

export function SocialShare({
  campaignCode,
  title = "Check out this campaign!",
}: SocialShareProps) {
  const shareUrl = `${window.location.origin}/campaign/${campaignCode}`;
  const shareText = `${title} ${shareUrl}`;

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(url, "_blank");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You might want to show a toast notification here
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={shareOnTwitter}>
        <Twitter className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={shareOnFacebook}>
        <Facebook className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={copyLink}>
        <Link className="h-4 w-4" />
      </Button>
    </div>
  );
}
