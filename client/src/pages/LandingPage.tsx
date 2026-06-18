import { LandingCTA } from "../components/landing/LandingCTA";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingHowItWorks } from "../components/landing/LandingHowItWorks";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { LandingWhatItDoes } from "../components/landing/LandingWhatItDoes";
import { LandingWhyDifferent } from "../components/landing/LandingWhyDifferent";

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#071a12] text-white">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingWhatItDoes />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingWhyDifferent />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
