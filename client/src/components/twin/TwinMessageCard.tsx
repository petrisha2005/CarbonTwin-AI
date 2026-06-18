import { MessageCircle } from "lucide-react";
import { Card } from "../Card";

export function TwinMessageCard({ message }: { message: string }) {
  return (
    <Card className="border-neon-green/30 bg-neon-green/10">
      <p className="flex items-center gap-2 text-sm font-semibold text-neon-green"><MessageCircle size={18} /> Message from your CarbonTwin</p>
      <p className="mt-3 text-2xl font-black leading-snug">{message}</p>
    </Card>
  );
}
