"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DashboardSummary } from "@/lib/api"

const SECTION_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

const FALLBACK = [
  { name: "Outcomes", weight: "25%", score: 0, maxScore: 6 },
  { name: "Outputs", weight: "25%", score: 0, maxScore: 6 },
  { name: "Service Delivery", weight: "20%", score: 0, maxScore: 6 },
  { name: "Management", weight: "15%", score: 0, maxScore: 6 },
  { name: "Cross-Cutting", weight: "15%", score: 0, maxScore: 6 },
]

interface SectionScoresProps {
  data?: DashboardSummary
}

export function SectionScores({ data }: SectionScoresProps) {
  // If we have a recent approved submission with sections, use it
  const latestSubmission = data?.recent_submissions?.find(s => s.status === "Approved")
  const avgScore = data?.avg_score ?? 0

  const sections = FALLBACK.map((fb, i) => ({
    ...fb,
    color: SECTION_COLORS[i % SECTION_COLORS.length],
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Section Performance Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sections.map((section) => {
            const percentage = (section.score / section.maxScore) * 100
            return (
              <div key={section.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2.5 rounded-sm", section.color)} />
                    <span className="text-sm font-medium text-foreground">
                      {section.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({section.weight})
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {section.score > 0 ? `${section.score.toFixed(1)}/${section.maxScore}` : "—"}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full transition-all", section.color)}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-lg bg-primary/5 p-3 border border-primary/10">
          <span className="text-sm font-medium text-foreground">
            Weighted Annual Score
          </span>
          <span className="text-xl font-bold text-primary">
            {avgScore > 0 ? avgScore.toFixed(2) : "—"} / 6.00
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
