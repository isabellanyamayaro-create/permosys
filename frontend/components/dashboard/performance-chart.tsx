"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const data = [
  { quarter: "Q1", Outcomes: 3.8, Outputs: 4.1, "Service Delivery": 3.5, Management: 4.0, "Cross-Cutting": 3.9 },
  { quarter: "Q2", Outcomes: 4.0, Outputs: 3.9, "Service Delivery": 3.8, Management: 4.2, "Cross-Cutting": 4.1 },
  { quarter: "Q3", Outcomes: 4.2, Outputs: 4.3, "Service Delivery": 4.0, Management: 4.1, "Cross-Cutting": 4.3 },
  { quarter: "Q4", Outcomes: 4.5, Outputs: 4.4, "Service Delivery": 4.2, Management: 4.5, "Cross-Cutting": 4.4 },
]

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Quarterly Performance by Section
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <YAxis
                domain={[0, 6]}
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
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
              />
              <Bar dataKey="Outcomes" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Outputs" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Service Delivery" fill="var(--color-chart-3)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Management" fill="var(--color-chart-4)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Cross-Cutting" fill="var(--color-chart-5)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
