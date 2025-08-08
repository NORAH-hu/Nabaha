import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

interface MasteryIndicatorProps {
  percentage: number;
  subject?: string;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
  showTrend?: boolean;
  previousPercentage?: number;
  className?: string;
}

export function MasteryIndicator({
  percentage,
  subject,
  showTooltip = true,
  size = "md",
  showTrend = false,
  previousPercentage,
  className
}: MasteryIndicatorProps) {
  const getMasteryLevel = (score: number) => {
    if (score >= 80) return { level: "high", color: "text-accent", bgColor: "bg-accent", label: "ممتاز" };
    if (score >= 60) return { level: "medium", color: "text-warning", bgColor: "bg-warning", label: "جيد" };
    return { level: "low", color: "text-destructive", bgColor: "bg-destructive", label: "يحتاج تحسين" };
  };

  const getTrend = () => {
    if (!showTrend || previousPercentage === undefined) return null;
    
    if (percentage > previousPercentage) {
      return { icon: TrendingUp, color: "text-accent", label: "تحسن" };
    } else if (percentage < previousPercentage) {
      return { icon: TrendingDown, color: "text-destructive", label: "انخفاض" };
    }
    return { icon: Minus, color: "text-muted-foreground", label: "ثابت" };
  };

  const mastery = getMasteryLevel(percentage);
  const trend = getTrend();

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-base"
  };

  const indicator = (
    <div className={cn(
      "relative inline-flex items-center justify-center rounded-full border-2 transition-all duration-300",
      mastery.color,
      `border-current ${mastery.level === 'high' ? 'mastery-high' : mastery.level === 'medium' ? 'mastery-medium' : 'mastery-low'}`,
      sizeClasses[size],
      "hover:scale-110 cursor-help",
      className
    )}>
      <Target className="w-1/2 h-1/2" />
      
      {/* Percentage overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-xs leading-none">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className={cn(
          "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center",
          "bg-background border border-current text-xs",
          trend.color
        )}>
          <trend.icon className="w-2 h-2" />
        </div>
      )}
    </div>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-center max-w-xs" dir="rtl">
          <div className="space-y-2">
            <div>
              <p className="font-semibold font-arabic">مستوى الإتقان</p>
              {subject && (
                <p className="text-sm text-muted-foreground font-arabic">{subject}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-arabic">{mastery.label}</span>
                <Badge variant="outline" className={cn("text-xs", mastery.color)}>
                  {Math.round(percentage)}%
                </Badge>
              </div>
              
              <Progress 
                value={percentage} 
                className="h-2"
                // Custom progress bar colors based on mastery level
                style={{
                  '--progress-background': mastery.level === 'high' 
                    ? 'hsl(var(--accent))' 
                    : mastery.level === 'medium' 
                    ? 'hsl(var(--warning))' 
                    : 'hsl(var(--destructive))'
                } as React.CSSProperties}
              />
            </div>

            {trend && previousPercentage !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-arabic">الاتجاه:</span>
                <div className={cn("flex items-center space-x-1 space-x-reverse", trend.color)}>
                  <trend.icon className="w-3 h-3" />
                  <span className="font-arabic">{trend.label}</span>
                  <span>
                    ({previousPercentage}% → {Math.round(percentage)}%)
                  </span>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground font-arabic">
              {percentage >= 80 && "أداء ممتاز! استمر في التقدم"}
              {percentage >= 60 && percentage < 80 && "أداء جيد، يمكن التحسين"}
              {percentage < 60 && "يحتاج إلى مراجعة وتركيز أكثر"}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Simplified version for quick use
export function SimpleMasteryIndicator({ percentage, className }: { percentage: number; className?: string }) {
  const mastery = percentage >= 80 ? "high" : percentage >= 60 ? "medium" : "low";
  const colors = {
    high: "text-accent border-accent",
    medium: "text-warning border-warning", 
    low: "text-destructive border-destructive"
  };

  return (
    <div className={cn(
      "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold",
      colors[mastery],
      className
    )}>
      {Math.round(percentage)}%
    </div>
  );
}
