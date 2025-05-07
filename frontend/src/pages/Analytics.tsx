
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
import KubectlCommandCard from '@/components/KubectlCommandCard';
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
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Pod data state
  const [pods, setPods] = useState<any[]>([]);
  const [podTotal, setPodTotal] = useState(0);
  
  // Node data state
  const [nodes, setNodes] = useState<any[]>([]);
  const [nodeTotal, setNodeTotal] = useState(0);

  // Helper function to calculate status counts
  const calculateStatusCounts = (items: any[]) => {
    const good = items.filter(item => 
      (item.predicted_label === 'good')
    ).length;
    
    const bad = items.filter(item => 
      (item.predicted_label === 'bad')
    ).length;
    
    const alert = items.filter(item => 
      (item.predicted_label === 'alert')
    ).length;
    
    return { good, bad , alert};
  };

  // Calculate resource metrics
  const calculateResourceMetrics = (items: any[], total: number) => {
    if (items.length === 0 || total === 0) return { cpuUsage: 0, memoryUsage: 0 };
    console.log(typeof items[0].cpu);  // This will print 'number', 'string', 'undefined', etc.

      let cpuSum: number = items.reduce((sum, item) => sum + item.cpu_usage, 0);
      let memorySum: number = items.reduce((sum, item) => sum + item.memory_usage, 0);

      // Optionally round to ensure integer result
      let cpuUsage: number = Math.round(cpuSum / total);
      let memoryUsage: number = Math.round(memorySum / total);
  
    return { cpuUsage, memoryUsage };
  };
  
  
  // Generate mock time series data for visualization
  const generateTimeSeriesData = () => {
    const points = 24;
    const now = Date.now();
    const timestamps = Array(points).fill(0).map((_, i) => 
      new Date(now - (points - i - 1) * 3600000).toISOString()
    );
    
    return {
      timestamps,
      cpu: Array(points).fill(0).map(() => Math.floor(30 + Math.random() * 60)),
      memory: Array(points).fill(0).map(() => Math.floor(40 + Math.random() * 40)),
      disk: Array(points).fill(0).map(() => Math.floor(20 + Math.random() * 50)),
      network: Array(points).fill(0).map(() => Math.floor(10 + Math.random() * 70)),
      restarts: Array(points).fill(0).map(() => Math.floor(Math.random() * 5)),
      errors: Array(points).fill(0).map(() => Math.floor(Math.random() * 10)),
    };
  };

  // Generate mock remediation history
  const generateRemediationHistory = (type: 'pod' | 'node', count: number) => {
    return Array(count).fill(0).map((_, i) => ({
      id: `remediation-${type}-${i + 1}`,
      resourceName: type === 'pod' ? pods[i % pods.length]?.name || `pod-name-${i}` : nodes[i % nodes.length]?.name || `node-${i}`,
      resourceNamespace: type === 'pod' ? 'default' : '-',
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString(),
      status: Math.random() > 0.2 ? 'success' : 'failed' as 'success' | 'failed',
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
        limit: 100,  // Get a larger sample for analytics
        timeRange,
      });
      
      setPods(data.data);
      const total = new Set(data.data.map(item => item.pod));
      //console.log(data.data[0]);
      //console.log(total);
      setPodTotal(total.size);
      //console.log(data)
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
        limit: 20,  // Get a larger sample for analytics
        timeRange,
      });
      setNodes(data.data);
      const total = new Set(data.data.map(item => item.node));
      console.log(data.data[0]);
      console.log(total);
      setNodeTotal(total.size);

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
  }, [fetchData, timeRange, viewType]);

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
  const statusCounts = calculateStatusCounts(currentItems); 
  console.log(currentItems[0]);
  const total = viewType === 'pods' ? podTotal : nodeTotal;
  const resourceMetrics = calculateResourceMetrics(currentItems, total);
  console.log(resourceMetrics);
  const timeSeriesData = generateTimeSeriesData();
  
  // For remediation metrics, generate mock data  
  const remediationCount = Math.floor(currentItems.length * 0.3);
  const remediationSuccess = Math.floor(remediationCount * 0.85);
  const remediationHistory = generateRemediationHistory(
    viewType === 'pods' ? 'pod' : 'node', 
    remediationCount
  );
  
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
      // Mock remediation action - in a real app, this would call an API
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
    // Create CSV content
    const headers = 'Resource Type,Total,Good,Warning,Critical,CPU,Memory,Disk,Network IO\n';
    const podsStatusCounts = calculateStatusCounts(pods);
    const podsMetrics = calculateResourceMetrics(pods, podTotal);
    const nodesStatusCounts = calculateStatusCounts(nodes);
    const nodesMetrics = calculateResourceMetrics(nodes, nodeTotal);
    
    const podsRow = `Pods,${podTotal},${podsStatusCounts.good},${podsStatusCounts.alert},${podsStatusCounts.bad},${Math.round(podsMetrics.cpuUsage)}%,${Math.round(podsMetrics.memoryUsage)}%,${Math.round(podsMetrics.diskUsage)}%,${Math.round(podsMetrics.networkIO)}%\n`;
    const nodesRow = `Nodes,${nodeTotal},${nodesStatusCounts.good},${nodesStatusCounts.alert},${nodesStatusCounts.bad},${Math.round(nodesMetrics.cpuUsage)}%,${Math.round(nodesMetrics.memoryUsage)}%,${Math.round(nodesMetrics.diskUsage)}%,${Math.round(nodesMetrics.networkIO)}%\n`;
    
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatusSummaryCard 
              title={`${viewType === 'pods' ? 'Pod' : 'Node'} Status`} 
              good={statusCounts.good}
              alert ={statusCounts.alert}
              bad ={statusCounts.bad}
              total={currentTotal}
              type={viewType}
            />
            
            <ResourceMetricsCard
              title="Average Resource Utilization"
              cpuUsage={resourceMetrics.cpuUsage}
              memoryUsage={resourceMetrics.memoryUsage}
            />
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Remediation Actions</CardTitle>
                <CardDescription>Total remediation attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">{remediationCount}</div>
                  <div className={`text-sm px-2 py-0.5 rounded-full ${
                    (remediationSuccess / remediationCount) > 0.9 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {remediationSuccess} successful
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <KubectlCommandCard resourceType={viewType} count={remediationCount} />
          </div>
          
          {/* Time Series Charts */}
          <div className="mb-8">
            <TimeSeriesChart 
              title={`${viewType === 'pods' ? 'Pod' : 'Node'} Metrics Over Time`}
              description="Resource utilization and error trends"
              data={timeSeriesData}
              showRestarts={viewType === 'pods'}
            />
          </div>
          
          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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

            <ModelPredictionCard 
              title="ML Model Classification"
              description="AI-based health prediction"
              resourceType={viewType}
              good={statusCounts.good}
              warning={statusCounts.warning}
              critical={statusCounts.critical}
            />
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
