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
  errors?: number[];
  restarts?: number[];
}

interface TimeSeriesChartProps {
  data: TimeSeriesData | null;
  title: string;
  description?: string;
  showRestarts?: boolean;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', 
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042'
];

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  data, 
  title, 
  description, 
  showRestarts = false
}) => {
  const [activeMetric, setActiveMetric] = useState<'usage' | 'errors'>('usage');
  
  if (data === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p>Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Data validation
  const validateData = () => {
    if (!data) return false;
    
    const requiredArrays = ['timestamps', 'cpu', 'memory'];
    const hasAllArrays = requiredArrays.every(key => 
      Array.isArray(data[key as keyof TimeSeriesData])
    );
    
    if (!hasAllArrays) return false;
    
    // Check all arrays have the same length
    const firstArrayLength = data.timestamps.length;
    return requiredArrays.every(key => 
      data[key as keyof TimeSeriesData].length === firstArrayLength
    );
  };

  if (!validateData()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center gap-2">
            <p className="text-red-500 font-medium">Invalid data format</p>
            <p className="text-sm text-gray-500 text-center">
              Required arrays: timestamps, cpu, memory<br />
              All arrays must be the same length
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for recharts
  const chartData = data.timestamps.map((timestamp, index) => ({
    name: new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    }),
    cpu: data.cpu[index] ?? 0,
    memory: data.memory[index] ?? 0,
    ...(data.errors && { errors: data.errors[index] ?? 0 }),
    ...(showRestarts && data.restarts && { restarts: data.restarts[index] ?? 0 })
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
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
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                </>
              ) : (
                <>
                  {data.errors && (
                    <Line type="monotone" dataKey="errors" stroke="#ff0000" name="Error Count" />
                  )}
                  {showRestarts && data.restarts && (
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
