import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "../Button";
import { Card } from "../Card";

export function JoinBattleCard({ busy, onJoin }: { busy?: boolean; onJoin: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <Card>
      <p className="label">Join Battle</p>
      <h2 className="mt-1 text-2xl font-black">Enter battle code</h2>
      <p className="mt-2 text-sm text-slate-400">Use the code your friend shared, like ECO-7F3K2.</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input className="field uppercase" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="ECO-7F3K2" />
        <Button disabled={busy || !code.trim()} onClick={() => onJoin(code.trim())} className="shrink-0"><KeyRound size={16} /> Join Battle</Button>
      </div>
    </Card>
  );
}
