
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ModelPredictionCardProps {
  title: string;
  description?: string;
  resourceType: 'pods' | 'nodes';
  good: number;
  warning: number;
  critical: number;
}

const ModelPredictionCard: React.FC<ModelPredictionCardProps> = ({
  title,
  description,
  resourceType,
  good,
  warning,
  critical
}) => {
  // Prepare data for pie chart
  const data = [
    { name: 'Good', value: good, color: '#10B981' },
    { name: 'Warning', value: warning, color: '#F59E0B' },
    { name: 'Critical', value: critical, color: '#EF4444' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} ${resourceType}`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-2">
          ML model classification result
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelPredictionCard;
