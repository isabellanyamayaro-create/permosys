"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const sections = [
  { name: "Outcomes", weight: "25%", score: 4.5, maxScore: 6, color: "bg-chart-1" },
  { name: "Outputs", weight: "25%", score: 4.4, maxScore: 6, color: "bg-chart-2" },
  { name: "Service Delivery", weight: "20%", score: 4.2, maxScore: 6, color: "bg-chart-3" },
  { name: "Management", weight: "15%", score: 4.5, maxScore: 6, color: "bg-chart-4" },
  { name: "Cross-Cutting", weight: "15%", score: 4.4, maxScore: 6, color: "bg-chart-5" },
]

export function SectionScores() {
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
                    {section.score}/{section.maxScore}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full transition-all", section.color)}
                    style={{ width: `${percentage}%` }}
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
            4.42 / 6.00
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
