import { BarChart3, Bot, Leaf, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { SetupProgress } from "../components/onboarding/SetupProgress";
import { completeWelcome, getPostLoginRedirect, skipOnboarding } from "../services/onboardingService";

const cards = [
  { icon: Leaf, title: "Track your lifestyle", text: "Log travel, electricity, food, and shopping choices." },
  { icon: BarChart3, title: "Understand your carbon footprint", text: "See daily, weekly, and monthly climate insights." },
  { icon: Sparkles, title: "Get AI suggestions", text: "Your AI Coach gives realistic no-guilt actions." },
  { icon: Bot, title: "Grow your CarbonTwin", text: "Complete Eco Quests, earn rewards, and watch your twin evolve." }
];

export function OnboardingPage() {
  const navigate = useNavigate();

  async function start() {
    await completeWelcome();
    navigate("/profile-setup", { replace: true });
  }

  async function skip() {
    const status = await skipOnboarding();
    navigate(getPostLoginRedirect(status), { replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SetupProgress step="Step 1 of 7: Welcome" percent={14} />
      <Card>
        <p className="text-sm font-semibold text-neon-green">Let’s set up your CarbonTwin in 2 minutes.</p>
        <h1 className="mt-2 text-4xl font-black">Welcome to CarbonTwin AI</h1>
        <p className="mt-3 max-w-3xl text-slate-300">Your personal climate intelligence twin helps you understand, track, and reduce your carbon footprint through small daily actions.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.title}>
            <card.icon className="text-neon-green" size={28} />
            <h2 className="mt-4 text-xl font-black">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{card.text}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={start}>Start Setup</Button>
          <Button variant="ghost" onClick={skip}>Skip welcome</Button>
        </div>
      </Card>
    </div>
  );
}
