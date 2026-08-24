import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CardValuation } from "@/lib/rewardEngine";
import { formatCompactINR, formatINR } from "@/lib/format";

interface ComparisonChartsProps {
  valuations: CardValuation[];
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function shortName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 16)}…` : name;
}

export function ComparisonCharts({ valuations }: ComparisonChartsProps) {
  const barData = valuations.map((v) => ({
    name: shortName(v.card.name),
    fullName: v.card.name,
    net: v.netAnnualValue,
  }));

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const lineData = months.map((month) => {
    const row: Record<string, number | string> = { month: `M${month}` };
    valuations.forEach((v) => {
      const monthlyNet = v.monthlyRewardValue - v.effectiveAnnualFee / 12;
      row[v.card.id] = Math.round(monthlyNet * month);
    });
    return row;
  });

  const best = [...valuations].sort((a, b) => b.netAnnualValue - a.netAnnualValue)[0];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h3 className="mb-1 font-display text-base font-semibold">Net annual value</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Gross rewards minus the effective annual fee.
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tickFormatter={(v: number) => formatCompactINR(v)}
                width={56}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => formatINR(value)}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
              />
              <Bar dataKey="net" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {best
            ? `${best.card.name} leads with a net annual value of ${formatINR(best.netAnnualValue)} on your spend profile.`
            : "Select cards to compare their net annual value."}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h3 className="mb-1 font-display text-base font-semibold">
          Cumulative value over 12 months
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Rewards accrue monthly while the annual fee is spread evenly — watch for the break-even
          crossover.
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v: number) => formatCompactINR(v)}
                width={56}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(value: number) => formatINR(value)} />
              <Legend
                formatter={(value: string) => {
                  const v = valuations.find((x) => x.card.id === value);
                  return v ? shortName(v.card.name) : value;
                }}
                wrapperStyle={{ fontSize: 11 }}
              />
              {valuations.map((v, i) => (
                <Line
                  key={v.card.id}
                  type="monotone"
                  dataKey={v.card.id}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {valuations.length > 0
            ? `By month 12, ${valuations
                .map(
                  (v) =>
                    `${v.card.name} reaches ${formatINR(Math.round((v.monthlyRewardValue - v.effectiveAnnualFee / 12) * 12))}`,
                )
                .join("; ")}.`
            : "Select cards to see cumulative net value over the year."}
        </p>
      </div>
    </div>
  );
}
