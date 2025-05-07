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
  metrics: {
    [key: string]: number[];
  };
  errors?: number[];
  restarts?: number[];
}

interface TimeSeriesChartProps {
  data: TimeSeriesData | null;
  title: string;
  description?: string;
  showRestarts?: boolean;
  usageMetrics?: string[]; // Optional: specify which metrics to show in usage tab
  errorMetrics?: string[]; // Optional: specify which metrics to show in errors tab
}

const DEFAULT_USAGE_METRICS = ['cpuUsage', 'memoryUsage'];
const DEFAULT_ERROR_METRICS = ['errors'];

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', 
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042'
];

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  data, 
  title, 
  description, 
  showRestarts = false,
  usageMetrics = DEFAULT_USAGE_METRICS,
  errorMetrics = DEFAULT_ERROR_METRICS
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
    
    if (!Array.isArray(data.timestamps) || !data.metrics) {
      return false;
    }
    
    // Check all metric arrays have the same length as timestamps
    return Object.values(data.metrics).every(metric => 
      Array.isArray(metric) && metric.length === data.timestamps.length
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
              Required: timestamps array and metrics object<br />
              All metric arrays must match timestamps length
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for recharts
  const chartData = data.timestamps.map((timestamp, index) => {
    const baseItem = {
      name: new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }),
      ...Object.fromEntries(
        Object.entries(data.metrics).map(([key, values]) => 
          [key, values[index] ?? 0]
        )
      ),
      ...(data.errors ? { errors: data.errors[index] ?? 0 } : {})
    };
  
    return showRestarts && data.restarts 
      ? { ...baseItem, restarts: data.restarts[index] ?? 0 }
      : baseItem;
  });

  // Get available metrics based on props and actual data
  const availableUsageMetrics = usageMetrics.filter(
    metric => data.metrics[metric]
  );
  const availableErrorMetrics = [
    ...errorMetrics,
    ...(showRestarts && data.restarts ? ['restarts'] : [])
  ];

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
                  {availableUsageMetrics.map((metric, index) => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={COLORS[index % COLORS.length]}
                      name={metric}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </>
              ) : (
                <>
                  {availableErrorMetrics.map((metric, index) => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={COLORS[index % COLORS.length]}
                      name={metric}
                      activeDot={{ r: 6 }}
                    />
                  ))}
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
