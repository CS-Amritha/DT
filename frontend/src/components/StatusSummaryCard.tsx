
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusSummaryCardProps {
  title: string;
  good: number;
  warning: number;
  critical: number;
  total: number;
  type: 'pods' | 'nodes';
}

const StatusSummaryCard: React.FC<StatusSummaryCardProps> = ({
  title,
  good,
  warning,
  critical,
  total,
  type
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription>Overall health status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{total}</div>
        <div className="text-sm text-muted-foreground">Total {type}</div>
        
        <div className="grid grid-cols-3 gap-1 mt-3">
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Good</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{good}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Warning</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="font-medium">{warning}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground">Critical</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium">{critical}</span>
            </div>
          </div>
        </div>
        
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-green-500 h-full" 
              style={{ width: `${total > 0 ? (good / total) * 100 : 0}%` }}
            ></div>
            <div 
              className="bg-amber-500 h-full" 
              style={{ width: `${total > 0 ? (warning / total) * 100 : 0}%` }}
            ></div>
            <div 
              className="bg-red-500 h-full" 
              style={{ width: `${total > 0 ? (critical / total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusSummaryCard;
