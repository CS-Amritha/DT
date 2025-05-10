import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowDown, ChartBar, PieChart as PieChartIcon, Search, Filter } from "lucide-react";
import { api, TimeRange } from '@/services/api';
import { toast } from 'sonner';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import RefreshIndicator from '@/components/RefreshIndicator';
import StatusSummaryCard from '@/components/StatusSummaryCard';
import RemediationHistoryTable from '@/components/RemediationHistoryTable';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import ResourceMetricsCard from '@/components/ResourceMetricsCard';
import ModelPredictionCard from '@/components/ModelPredictionCard';
import AnalyticsFilters from '@/components/AnalyticsFilters';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("last_1h");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [viewType, setViewType] = useState<'pods' | 'nodes'>('pods');
  const [remediationModalOpen, setRemediationModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ name: string; issue: string } | null>(null);
  const [isRemediating, setIsRemediating] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Pod data state
  const [pods, setPods] = useState<any[]>([]);
  const [podTotal, setPodTotal] = useState(0);
  
  // Node data state
  const [nodes, setNodes] = useState<any[]>([]);
  const [nodeTotal, setNodeTotal] = useState(0);

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to calculate status counts
  const calculateStatusCounts = (items: any[], identifierKey: 'pod' | 'node_name' = 'pod') => {
    // Group items by their identifier (pod or node_name), keeping only the latest entry
    const latestItemsMap = new Map<string, any>();
    
    items.forEach(item => {
        const identifier = item[identifierKey];
        if (!identifier) return; // skip if identifier is missing
        
        const existingItem = latestItemsMap.get(identifier);
        
        // Keep the item if:
        // 1. This identifier isn't in the map yet, OR
        // 2. The current item has a newer timestamp
        if (!existingItem || (item.timestamp > existingItem.timestamp)) {
            latestItemsMap.set(identifier, item);
        }
    });
    
    // Convert the map values to an array
    const latestItems = Array.from(latestItemsMap.values());
    
    // Count each status type
    const counts = {
        good: latestItems.filter(item => item.predicted_label === 'good').length,
        bad: latestItems.filter(item => item.predicted_label === 'bad').length,
        alert: latestItems.filter(item => item.predicted_label === 'alert').length
    };
    
    return counts;
};

  // Calculate resource metrics
  const calculateResourceMetrics = (items: any[], total: number) => {
    if (items.length === 0 || total === 0) return { cpuUsage: 0, memoryUsage: 0 };
    
    let cpuSum = items.reduce((sum, item) => sum + (item.cpu_usage || 0), 0);
    let memorySum = items.reduce((sum, item) => sum + (item.memory_usage || 0), 0);

    // Calculate averages
    const cpuUsage = Math.round(cpuSum / items.length);
    const memoryUsage = Math.round(memorySum / items.length);
  
    return { cpuUsage, memoryUsage };
  };
  
  // Generate mock time series data for visualization
  const generateTimeSeriesData = (metricsArray: any[]) => {
    const points = 24;
    const now = Date.now();
    const timestamps = Array(points).fill(0).map((_, i) => 
        new Date(now - (points - i - 1) * 3600000).toISOString()
    );

    // Initialize aggregated metrics
    const cpuUsage = Array(points).fill(0);
    const memoryUsage = Array(points).fill(0);

    // Process each item's metrics
    metricsArray.forEach(item => {
        const itemTimestamp = new Date(item.timestamp).getTime();
        const hourIndex = Math.floor((now - itemTimestamp) / 3600000);
        
        if (hourIndex >= 0 && hourIndex < points) {
            cpuUsage[hourIndex] += item.cpu_usage || 0;
            memoryUsage[hourIndex] += item.memory_usage || 0;
        }
    });

    return {
        timestamps,
        cpuUsage,
        memoryUsage,
    };
  };

  // Generate mock remediation history
  const generateRemediationHistory = (type: 'pod' | 'node', count: number) => {
    const resourceNames = type === 'pod' 
      ? pods.map(p => p.name) 
      : nodes.map(n => n.name);
    
    return Array(count).fill(0).map((_, i) => ({
      id: `remediation-${type}-${i + 1}`,
      resourceName: resourceNames[i % resourceNames.length] || `${type}-${i}`,
      resourceNamespace: type === 'pod' ? 'default' : '-',
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString(),
      status: Math.random() > 0.2 ? 'success' : 'failed' as const,
      issue: i % 3 === 0 ? 'Resource constraint' : i % 2 === 0 ? 'Crash looping' : 'Network connectivity',
      action: i % 3 === 0 ? 'Restarted' : i % 2 === 0 ? 'Scaled resources' : 'Recreated',
    }));
  };

  // Fetch pod data
  const fetchPods = useCallback(async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setIsRefreshing(true);
      
      const data = await api.fetchPods({
        limit: 100,
        timeRange,
      });
      
      setPods(data.data);
      const uniquePods = new Set(data.data.map(item => item.pod));
      setPodTotal(uniquePods.size);
      setLastRefreshed(new Date());
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Error fetching pods:', error);
        toast.error('Failed to fetch pods data');
      }
    } finally {
      if (viewType === 'pods') {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [timeRange, viewType]);

  // Fetch node data
  const fetchNodes = useCallback(async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setIsRefreshing(true);
      
      const data = await api.fetchNodes({
        limit: 20,
        timeRange,
      });
      setNodes(data.data);
      const uniqueNodes = new Set(data.data.map(item => item.node_name));
      setNodeTotal(uniqueNodes.size);
      setLastRefreshed(new Date());
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Error fetching nodes:', error);
        toast.error('Failed to fetch nodes data');
      }
    } finally {
      if (viewType === 'nodes') {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [timeRange, viewType]);

  // Fetch data based on view type
  const fetchData = useCallback(() => {
    if (viewType === 'pods') {
      fetchPods();
    } else {
      fetchNodes();
    }
  }, [fetchPods, fetchNodes, viewType]);

  useEffect(() => {
    fetchData();
    
    // Set up regular refresh interval
    refreshIntervalRef.current = setInterval(() => {
      fetchData();
    }, 120000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  };

  const handleRefresh = () => {
    fetchData();
  };
  
  const handleFilterChange = (filters: any) => {
    console.log('Filters applied:', filters);
    setFiltersApplied(true);
    toast.success('Filters applied. Refreshing data...');
    fetchData();
  };

  // Get current data based on view type
  const currentItems = viewType === 'pods' ? pods : nodes;
  const currentTotal = viewType === 'pods' ? podTotal : nodeTotal;
  const statusCounts = viewType === 'pods' ? calculateStatusCounts(currentItems, 'pod') : calculateStatusCounts(currentItems, 'node_name'); 
  const resourceMetrics = calculateResourceMetrics(currentItems, currentItems.length);
  const timeSeriesData = generateTimeSeriesData(currentItems);
  
  // For remediation metrics, generate mock data  
  const remediationCount = Math.floor(currentItems.length * 0.3);
  const remediationSuccess = Math.floor(remediationCount * 0.85);
  const remediationHistory = generateRemediationHistory(
    viewType === 'pods' ? 'pod' : 'node', 
    remediationCount
  );

  const transformedData = timeSeriesData ? {
    timestamps: timeSeriesData.timestamps,
    cpu: timeSeriesData.cpuUsage,
    memory: timeSeriesData.memoryUsage,
    errors: Array(timeSeriesData.timestamps.length).fill(0)
  } : null;
  
  // Prepare data for pie chart
  const statusData = [
    { name: 'Good', value: statusCounts.good, color: '#10B981' },
    { name: 'Alert', value: statusCounts.alert, color: '#F59E0B' },
    { name: 'Bad', value: statusCounts.bad, color: '#EF4444' }
  ];

  const remediationData = [
    { name: 'Success', value: remediationSuccess, color: '#10B981' },
    { name: 'Failed', value: remediationCount - remediationSuccess, color: '#EF4444' }
  ];
  
  const openRemediationModal = (resource: { name: string; issue: string }) => {
    setSelectedResource(resource);
    setRemediationModalOpen(true);
  };
  
  const handleRemediate = async () => {
    if (!selectedResource) return;
    
    setIsRemediating(true);
    try {
      // Mock remediation action
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = Math.random() > 0.1;
      
      if (success) {
        toast.success(`Successfully remediated ${selectedResource.name}`);
      } else {
        toast.error(`Failed to remediate ${selectedResource.name}`);
      }
      
      // Refresh data after remediation
      fetchData();
      setRemediationModalOpen(false);
    } catch (error) {
      console.error('Error during remediation:', error);
      toast.error('Remediation action failed');
    } finally {
      setIsRemediating(false);
    }
  };
  
  const downloadCSV = () => {
    const headers = 'Resource Type,Total,Good,Alert,Bad,CPU,Memory\n';
    const podsStatusCounts = calculateStatusCounts(pods, 'pod');
    const podsMetrics = calculateResourceMetrics(pods, pods.length);
    const nodesStatusCounts = calculateStatusCounts(nodes, 'node_name');
    const nodesMetrics = calculateResourceMetrics(nodes, nodes.length);
    
    const podsRow = `Pods,${podTotal},${podsStatusCounts.good},${podsStatusCounts.alert},${podsStatusCounts.bad},${podsMetrics.cpuUsage}%,${podsMetrics.memoryUsage}%\n`;
    const nodesRow = `Nodes,${nodeTotal},${nodesStatusCounts.good},${nodesStatusCounts.alert},${nodesStatusCounts.bad},${nodesMetrics.cpuUsage}%,${nodesMetrics.memoryUsage}%\n`;
    
    const csvContent = headers + podsRow + nodesRow;
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kubernetes_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Analytics data downloaded as CSV');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Cluster Analytics</h1>
          <p className="text-gray-500">Insights and remediation metrics for your Kubernetes cluster</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
          <Button variant="outline" onClick={downloadCSV} className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setFiltersApplied(!filtersApplied)} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {filtersApplied ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>
      
      {filtersApplied && (
        <AnalyticsFilters onFilterChange={handleFilterChange} />
      )}
      
      <div className="flex items-center justify-between mb-6">
        <Tabs defaultValue="pods" className="w-full max-w-md" onValueChange={(value) => setViewType(value as 'pods' | 'nodes')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pods">Pods</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <RefreshIndicator 
          isRefreshing={isRefreshing} 
          lastRefreshed={lastRefreshed} 
          onRefresh={handleRefresh}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Resource Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatusSummaryCard 
              title={`${viewType === 'pods' ? 'Pod' : 'Node'} Status`} 
              good={statusCounts.good}
              alert={statusCounts.alert}
              bad={statusCounts.bad}
              total={currentTotal}
              type={viewType}
            />
            
            <ResourceMetricsCard
              title="Average Resource Utilization"
              cpuUsage={resourceMetrics.cpuUsage}
              memoryUsage={resourceMetrics.memoryUsage}
            />
            
      </div>
          

          <TimeSeriesChart 
            title={`${viewType === 'pods' ? 'Pod' : 'Node'} Metrics Over Time`}
            description="Resource utilization and error trends"
            data={transformedData}
            showRestarts={viewType === 'pods'}
          />
          
          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <PieChartIcon size={18} />
                    Status Distribution
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} ${viewType}`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <ChartBar size={18} />
                    Remediation Results
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {remediationCount > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={remediationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {remediationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No remediation data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            
          </div>
          
          {/* Remediation History Table */}
          <RemediationHistoryTable 
            data={remediationHistory} 
            resourceType={viewType}
            onRemediate={openRemediationModal}
          />
          
          {/* Remediation Modal */}
          <Dialog open={remediationModalOpen} onOpenChange={setRemediationModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remediate {selectedResource?.name}</DialogTitle>
                <DialogDescription>
                  The following issue was detected with this resource
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Detected Issue:</h4>
                  <p className="text-sm text-muted-foreground">{selectedResource?.issue || 'Resource constraint detected'}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Recommended Action:</h4>
                  <p className="text-sm text-muted-foreground">Restart the {viewType === 'pods' ? 'pod' : 'node'} to clear transient issues</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Kubectl Command:</h4>
                  <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                    kubectl {viewType === 'pods' ? 'delete pod' : 'cordon'} {selectedResource?.name} {viewType === 'pods' ? '' : '&& kubectl drain ' + selectedResource?.name}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setRemediationModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleRemediate} 
                  disabled={isRemediating}
                  className={isRemediating ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {isRemediating ? 'Remediating...' : 'Apply Remediation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Analytics;
