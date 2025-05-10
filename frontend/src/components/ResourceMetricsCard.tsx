
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ResourceMetricsCardProps {
  title: string;
  cpuUsage: number;
  memoryUsage: number;
}

const ResourceMetricsCard: React.FC<ResourceMetricsCardProps> = ({
  title,
  cpuUsage,
  memoryUsage,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">CPU</span>
              <span className="font-medium">{Math.round(cpuUsage)}%</span>
            </div>
            <Progress value={cpuUsage} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Memory</span>
              <span className="font-medium">{Math.round(memoryUsage)}%</span>
            </div>
            <Progress value={memoryUsage} className="h-1" />
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceMetricsCard;
