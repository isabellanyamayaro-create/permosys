"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { DashboardSummary } from "@/lib/api"

type TrendPoint = NonNullable<DashboardSummary["trend"]>[number]

const FALLBACK = [
  { month: "Jul", score: 3.5 },
  { month: "Aug", score: 3.7 },
  { month: "Sep", score: 3.8 },
  { month: "Oct", score: 4.0 },
  { month: "Nov", score: 4.1 },
  { month: "Dec", score: 4.2 },
]

export function TrendChart({ data }: { data?: TrendPoint[] }) {
  const chartData =
    data && data.length > 0
      ? data.map((d) => ({ month: `${d.quarter} ${d.period}`, score: d.avg }))
      : FALLBACK
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Year-to-Date Score Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <YAxis
                domain={[2, 6]}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--color-foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
