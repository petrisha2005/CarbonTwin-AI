import { useMemo, useState } from "react";
import { Brain, Coffee, Moon, SunMedium } from "lucide-react";
import { Button } from "../Button";
import { Card } from "../Card";

const moods = [
  { id: "tired", label: "Tired", icon: Moon, title: "Low-energy eco win", action: "Take a 5 minute lights-off reset and log one Eco Quest action." },
  { id: "busy", label: "Busy", icon: Coffee, title: "Tiny commute choice", action: "Pick public transport, walking, or bicycle for one trip today." },
  { id: "motivated", label: "Motivated", icon: SunMedium, title: "Boss damage streak", action: "Complete one mission and one daily tracker entry today." }
];

export function MoodMissionCard() {
  const [mood, setMood] = useState("");
  const selected = useMemo(() => moods.find((item) => item.id === mood), [mood]);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">Mood Mission</p>
          <h2 className="mt-1 text-xl font-black">Match the mission to your energy</h2>
        </div>
        <Brain className="text-neon-green" size={30} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {moods.map((item) => (
          <button
            key={item.id}
            onClick={() => setMood(item.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              mood === item.id ? "bg-neon-green text-carbon-950" : "bg-white/10 text-slate-200 hover:bg-white/15"
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-lg border border-neon-green/20 bg-neon-green/10 p-4">
        <h3 className="font-bold text-neon-green">{selected?.title ?? "Choose your energy level"}</h3>
        <p className="mt-2 text-sm text-slate-200">{selected?.action ?? "No mood mission is selected by default."}</p>
      </div>
      <Button className="mt-4" variant="secondary" onClick={() => window.location.assign("/eco-quest")}>
        Open Eco Quest
      </Button>
    </Card>
  );
}
