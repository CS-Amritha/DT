
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, TimeRange } from '@/services/api';
import DataGrid from '@/components/DataGrid';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import Pagination from '@/components/Pagination';
import ExplainModal from '@/components/ExplainModal';
import RefreshIndicator from '@/components/RefreshIndicator';
import { toast } from '@/components/ui/sonner';

const PodsPage: React.FC = () => {
  const [pods, setPods] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('last_5m');
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [selectedPod, setSelectedPod] = useState<any | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPods = useCallback(async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setIsRefreshing(true);
      
      const data = await api.fetchPods({
        limit: pageSize,
        skip: currentPage * pageSize,
        timeRange,
      });
      
      setPods(data.data);
      setHasMore(data.skip + data.count < data.total);
      setLastRefreshed(new Date());
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Error fetching pods:', error);
        toast.error('Failed to fetch pods data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, timeRange, pageSize]);

  const handleExplain = async (podData: any) => {
    setSelectedPod(podData);
    setExplainModalOpen(true);
    setIsExplaining(true);
    setExplanation(null);
    
    try {
      const result = await api.explainPod(podData);
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Error explaining pod:', error);
      toast.error('Failed to get explanation');
      setExplanation('Failed to get explanation. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
    setCurrentPage(0); // Reset to first page when changing time range
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  useEffect(() => {
    fetchPods();
    
    // Set up regular refresh interval
    refreshIntervalRef.current = setInterval(() => {
      fetchPods();
    }, 5000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPods]);

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Kubernetes Pods</h1>
        <p className="text-gray-500">Monitor and manage your pods</p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
        <RefreshIndicator isRefreshing={isRefreshing} lastRefreshed={lastRefreshed} />
      </div>
      
      {isLoading && pods.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-kubernetes-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-4">
            <DataGrid 
              data={pods} 
              isPods={true} 
              onExplain={handleExplain} 
            />
          </div>
          
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            hasMore={hasMore}
          />
        </>
      )}
      
      <ExplainModal
        isOpen={explainModalOpen}
        onClose={() => setExplainModalOpen(false)}
        explanation={explanation}
        isLoading={isExplaining}
        podData={selectedPod}
      />
    </div>
  );
};

export default PodsPage;
