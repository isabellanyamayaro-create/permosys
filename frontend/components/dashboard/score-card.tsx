"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface ScoreCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon: React.ReactNode
  variant?: "default" | "primary" | "success" | "warning" | "destructive"
}

export function ScoreCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  variant = "default",
}: ScoreCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden border transition-shadow hover:shadow-md",
      variant === "primary" && "border-primary/20 bg-primary/[0.03]",
      variant === "success" && "border-success/20 bg-success/[0.03]",
      variant === "warning" && "border-warning/20 bg-warning/[0.03]",
      variant === "destructive" && "border-destructive/20 bg-destructive/[0.03]",
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </span>
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
          <div className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            variant === "default" && "bg-secondary text-muted-foreground",
            variant === "primary" && "bg-primary/10 text-primary",
            variant === "success" && "bg-success/10 text-success",
            variant === "warning" && "bg-warning/10 text-warning",
            variant === "destructive" && "bg-destructive/10 text-destructive",
          )}>
            {icon}
          </div>
        </div>
        {trend && trendValue && (
          <div className="mt-3 flex items-center gap-1.5">
            {trend === "up" && (
              <span className="flex items-center text-xs font-medium text-success">
                <ArrowUp className="size-3" />
                {trendValue}
              </span>
            )}
            {trend === "down" && (
              <span className="flex items-center text-xs font-medium text-destructive">
                <ArrowDown className="size-3" />
                {trendValue}
              </span>
            )}
            {trend === "neutral" && (
              <span className="flex items-center text-xs font-medium text-muted-foreground">
                <Minus className="size-3" />
                {trendValue}
              </span>
            )}
            <span className="text-xs text-muted-foreground">vs last quarter</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
