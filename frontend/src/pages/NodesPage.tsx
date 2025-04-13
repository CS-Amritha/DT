
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, TimeRange } from '@/services/api';
import DataGrid from '@/components/DataGrid';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import Pagination from '@/components/Pagination';
import RefreshIndicator from '@/components/RefreshIndicator';
import { toast } from '@/components/ui/sonner';

const NodesPage: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('last_5m');
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize, setPageSize] = useState(5);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNodes = useCallback(async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setIsRefreshing(true);
      
      const data = await api.fetchNodes({
        limit: pageSize,
        skip: currentPage * pageSize,
        timeRange,
      });
      
      setNodes(data);
      setHasMore(data.length === pageSize);
      setLastRefreshed(new Date());
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Error fetching nodes:', error);
        toast.error('Failed to fetch nodes data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, timeRange, pageSize]);

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
    fetchNodes();
    
    // Set up regular refresh interval
    refreshIntervalRef.current = setInterval(() => {
      fetchNodes();
    }, 2000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNodes]);

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Kubernetes Nodes</h1>
        <p className="text-gray-500">Monitor node health and resources</p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
        <RefreshIndicator isRefreshing={isRefreshing} lastRefreshed={lastRefreshed} />
      </div>
      
      {isLoading && nodes.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-kubernetes-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-4">
            <DataGrid data={nodes} />
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
    </div>
  );
};

export default NodesPage;
