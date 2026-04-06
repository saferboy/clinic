import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'bg-blue-100 text-blue-600',
  trend,
}: StatsCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', iconColor)}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
