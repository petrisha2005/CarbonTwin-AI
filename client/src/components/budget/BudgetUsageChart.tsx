import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategoryBudget } from "../../services/budgetService";
import { Card } from "../Card";

const tooltipStyle = {
  backgroundColor: "#111c18",
  border: "1px solid rgba(34,197,94,0.35)",
  borderRadius: 8,
  color: "#f8fafc"
};

export function BudgetUsageChart({ items }: { items: CategoryBudget[] }) {
  const data = items.map((item) => ({ name: item.label.replace(" & Waste", ""), budget: item.budget, used: item.used }));
  return (
    <Card>
      <h3 className="text-xl font-black">Category Budget Usage Chart</h3>
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis dataKey="name" stroke="#cbd5e1" />
            <YAxis stroke="#cbd5e1" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="budget" name="Budget" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="used" name="Used" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
