"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ScoreCard } from "@/components/dashboard/score-card"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { EntityRanking } from "@/components/dashboard/entity-ranking"
import { SectionScores } from "@/components/dashboard/section-scores"
import {
  Target,
  TrendingUp,
  FileCheck,
  AlertTriangle,
} from "lucide-react"
import { getDashboard, type DashboardSummary } from "@/lib/api"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    getDashboard().then(setData).catch(console.error)
  }, [])

  const atRisk = data
    ? data.entity_ranking.filter((e) => e.avg_score < 3.0).length
    : 0

  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Score Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ScoreCard
              title="Average Score"
              value={data ? data.avg_score.toFixed(2) : "—"}
              subtitle="Out of 6.00"
              trend="up"
              trendValue="0.3"
              icon={<Target className="size-5" />}
              variant="primary"
            />
            <ScoreCard
              title="Entities Tracked"
              value={data ? String(data.entity_ranking.length) : "—"}
              subtitle={`${data?.entity_ranking.filter((e) => e.avg_score >= 3.0).length ?? 0} performing well`}
              trend="up"
              trendValue="0"
              icon={<TrendingUp className="size-5" />}
              variant="success"
            />
            <ScoreCard
              title="Total Submissions"
              value={data ? String(data.total_submissions) : "—"}
              subtitle={`${data?.approved ?? 0} approved · ${data?.pending ?? 0} pending`}
              trend="neutral"
              trendValue="0"
              icon={<FileCheck className="size-5" />}
            />
            <ScoreCard
              title="At Risk"
              value={data ? String(atRisk) : "—"}
              subtitle="Below 3.0 threshold"
              trend={atRisk > 0 ? "down" : "neutral"}
              trendValue={String(atRisk)}
              icon={<AlertTriangle className="size-5" />}
              variant="destructive"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <PerformanceChart />
            <TrendChart data={data?.trend} />
          </div>

          {/* Bottom Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionScores />
            <EntityRanking data={data?.entity_ranking} />
          </div>
        </div>
      </div>
    </>
  )
}

