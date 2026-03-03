"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { DashboardSummary } from "@/lib/api"

type RankingItem = DashboardSummary["entity_ranking"][number]

function toStatus(score: number): "green" | "yellow" | "red" {
  if (score >= 4.0) return "green"
  if (score >= 3.0) return "yellow"
  return "red"
}

function toRating(score: number): string {
  if (score >= 5.0) return "Excellent"
  if (score >= 4.0) return "Good"
  if (score >= 3.0) return "Satisfactory"
  if (score >= 2.0) return "Needs Improvement"
  return "Poor"
}

const FALLBACK = [
  { entity__name: "Ministry of Finance", avg_score: 4.6, entity__id: 1, entity__short_name: "MFPE", total: 2 },
  { entity__name: "Ministry of Health", avg_score: 4.3, entity__id: 2, entity__short_name: "MHSS", total: 2 },
  { entity__name: "Ministry of Education", avg_score: 4.1, entity__id: 3, entity__short_name: "MEAC", total: 2 },
]

function StatusDot({ status }: { status: "green" | "yellow" | "red" }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        status === "green" && "bg-success",
        status === "yellow" && "bg-warning",
        status === "red" && "bg-destructive",
      )}
    />
  )
}

export function EntityRanking({ data }: { data?: RankingItem[] }) {
  const rows = (data && data.length > 0 ? data : FALLBACK).map((e) => ({
    name: e.entity__name,
    score: e.avg_score,
    rating: toRating(e.avg_score),
    status: toStatus(e.avg_score),
    progress: Math.round((e.avg_score / 6) * 100),
  }))
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Entity Performance Ranking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows.map((entity, index) => (
            <div key={entity.name} className="flex items-center gap-3">
              <span className="w-5 text-center text-xs font-bold text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusDot status={entity.status} />
                    <span className="text-sm font-medium text-foreground truncate">
                      {entity.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0",
                        entity.status === "green" && "bg-success/10 text-success",
                        entity.status === "yellow" && "bg-warning/10 text-warning-foreground",
                        entity.status === "red" && "bg-destructive/10 text-destructive",
                      )}
                    >
                      {entity.rating}
                    </Badge>
                    <span className="text-sm font-semibold tabular-nums text-foreground w-8 text-right">
                      {entity.score}
                    </span>
                  </div>
                </div>
                <Progress
                  value={entity.progress}
                  className={cn(
                    "h-1.5",
                    entity.status === "green" && "[&>div]:bg-success",
                    entity.status === "yellow" && "[&>div]:bg-warning",
                    entity.status === "red" && "[&>div]:bg-destructive",
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
