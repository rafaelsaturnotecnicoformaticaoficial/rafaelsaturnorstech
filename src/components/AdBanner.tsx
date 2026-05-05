import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  /** AdSense slot ID. Defaults to the responsive site-wide slot. */
  slot?: string;
  /** Layout format: 'auto' (responsive), 'fluid' (in-feed/in-article), 'rectangle', etc. */
  format?: string;
  /** Visual variant controlling min height and max width per breakpoint. */
  variant?: "leaderboard" | "rectangle" | "in-article";
  className?: string;
}

const VARIANT_STYLES: Record<NonNullable<AdBannerProps["variant"]>, string> = {
  // Top/bottom banner: tall enough on mobile, leaderboard on desktop
  leaderboard: "max-w-[970px] min-h-[100px] md:min-h-[90px]",
  // In-content rectangle (good CTR on mobile)
  rectangle: "max-w-[336px] min-h-[280px]",
  // Between sections: fluid in-article
  "in-article": "max-w-[728px] min-h-[250px]",
};

const AdBanner = ({
  slot = "7585213332",
  format = "auto",
  variant = "leaderboard",
  className = "",
}: AdBannerProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!pushed.current && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // AdSense not loaded yet
      }
    }
  }, []);

  return (
    <div className={`w-full px-2 py-3 md:py-4 flex justify-center bg-background ${className}`}>
      <ins
        ref={adRef}
        className={`adsbygoogle block w-full ${VARIANT_STYLES[variant]}`}
        style={{ display: "block" }}
        data-ad-client="ca-pub-6201099098547406"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
