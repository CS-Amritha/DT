
import React from 'react';

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  lastRefreshed: Date | null;
}

const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({ isRefreshing, lastRefreshed }) => {
  return (
    <div className="flex items-center space-x-2">
      <span 
        className={`h-2 w-2 rounded-full ${isRefreshing ? 'bg-kubernetes-purple animate-pulse-gentle' : 'bg-green-500'}`}
      />
      <span className="text-xs text-gray-500">
        {isRefreshing ? (
          'Refreshing...'
        ) : (
          lastRefreshed ? `Last updated: ${lastRefreshed.toLocaleTimeString()}` : 'Not yet refreshed'
        )}
      </span>
    </div>
  );
};

export default RefreshIndicator;
