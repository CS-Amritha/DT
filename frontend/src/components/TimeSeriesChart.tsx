
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface TimeSeriesData {
  timestamps: string[];
  cpu: number[];
  memory: number[];
  disk: number[];
  network: number[];
  restarts?: number[];
  errors: number[];
}

interface TimeSeriesChartProps {
  data: TimeSeriesData;
  title: string;
  description?: string;
  showRestarts?: boolean;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  data, 
  title, 
  description, 
  showRestarts = false 
}) => {
  const [activeMetric, setActiveMetric] = useState<'usage' | 'errors'>('usage');
  
  // Format data for recharts
  const chartData = data.timestamps.map((timestamp, index) => {
    const item: any = {
      name: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: data.cpu[index],
      memory: data.memory[index],
      disk: data.disk[index],
      network: data.network[index],
      errors: data.errors[index],
    };
    
    if (showRestarts && data.restarts) {
      item.restarts = data.restarts[index];
    }
    
    return item;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <Tabs 
            defaultValue="usage" 
            className="w-[300px]"
            onValueChange={(value) => setActiveMetric(value as 'usage' | 'errors')}
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="usage">Resource Usage</TabsTrigger>
              <TabsTrigger value="errors">Errors & Restarts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              
              {activeMetric === 'usage' ? (
                <>
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                  <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Disk %" />
                  <Line type="monotone" dataKey="network" stroke="#ff8042" name="Network I/O %" />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="errors" stroke="#ff0000" name="Error Count" activeDot={{ r: 8 }} />
                  {showRestarts && (
                    <Line type="monotone" dataKey="restarts" stroke="#ff8042" name="Restart Count" />
                  )}
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSeriesChart;
