'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Visit } from '@/lib/types';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';

interface VisitsCalendarProps {
  visits: Visit[];
  onDateSelect?: (date: Date) => void;
}

export function VisitsCalendar({ visits, onDateSelect }: VisitsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getVisitsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return visits.filter((visit) => {
      const visitDateKey = formatDateKey(new Date(visit.appointmentDate));
      return visitDateKey === dateKey;
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'no-show': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Visits Calendar</CardTitle>
            <CardDescription>Schedule and track appointments</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-max text-sm font-medium">{monthName}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const dayVisits = getVisitsForDate(date);
              const isToday =
                date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => onDateSelect?.(date)}
                  className={`aspect-square rounded-lg border p-2 text-left text-xs transition-colors ${
                    isToday
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {date.getDate()}
                  </div>
                  {dayVisits.length > 0 && (
                    <div className="space-y-1">
                      {dayVisits.slice(0, 2).map((visit) => (
                        <div
                          key={visit.id}
                          className={`rounded px-1 py-0.5 ${
                            statusColors[visit.status as keyof typeof statusColors]
                          }`}
                        >
                          <div className="truncate font-medium">
                            {visit.appointmentTime}
                          </div>
                        </div>
                      ))}
                      {dayVisits.length > 2 && (
                        <div className="text-gray-500">
                          +{dayVisits.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
