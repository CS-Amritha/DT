import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { downloadAsJson, downloadAsCsv } from '@/utils/download';
import { toast } from '@/components/ui/sonner';

interface DataGridProps {
  data: any[];
  isPods?: boolean;
  onExplain?: (rowData: any) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ data, isPods = false, onExplain }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const handleDownload = (format: 'json' | 'csv', rowData: any) => {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const resourceType = isPods ? 'pod' : 'node';
    const resourceName = rowData.name || rowData.pod || rowData.node || 'resource';
    const filename = `${resourceType}-${resourceName}-${timestamp}`;

    if (format === 'json') {
      downloadAsJson(rowData, filename);
    } else {
      downloadAsCsv(rowData, filename);
    }

    toast.success(`Downloaded ${format.toUpperCase()} file`);
  };

  const podColumns = [
    'timestamp', 'namespace', 'pod', 'node',
    'cpu_usage', 'memory_usage', 'cpu_limit', 'memory_limit',
    'cpu_request', 'memory_request', 'cpu_throttling', 'memory_rss',
    'network_receive_bytes', 'network_transmit_bytes',
    'predicted_label', 'prob_good', 'prob_bad', 'prob_alert'
  ];

  const nodeColumns = [
    'timestamp', 'node_name', 'node_cpu_usage', 'node_cpu_usage_percent', 'nonde_cpu_load_1m_ratio',
    'node_cpu_capacity', 'node_cpu_allocatable', 'node_cpu_utilization_ratio',
    'node_memory_usage', 'node_memory_available_percent', 'node_swap_usage_percent',
    'node_memory_capacity', 'node_memory_allocatable',
    'node_disk_usage', 'node_disk_utilization_ratio', 'node_disk_io_time_percent',
    'node_network_receive_bytes', 'node_network_transmit_bytes', 'node_network_errors',
    'node_ready', 'node_memory_pressure', 'node_disk_pressure',
    'node_pid_pressure', 'node_unschedulable', 'node_age_seconds',
    'predicted_label', 'prob_good', 'prob_bad', 'prob_alert'

  ];

  const columns = isPods ? podColumns : nodeColumns;
  const normalizeKeys = (data: any) => {
    const mapping: Record<string, string> = {
      'CPU Throttling': 'CPU_Throttling',
      'High CPU Usage': 'High_CPU_Usage',
      'OOMKilled (Out of Memory)': 'OOMKilled_Out_of_Memory',
      'CrashLoopBackOff': 'CrashLoopBackOff',
      'ContainerNotReady': 'ContainerNotReady',
      'PodUnschedulable': 'PodUnschedulable',
      'NodePressure': 'NodePressure',
      'ImagePullFailure': 'ImagePullFailure',
    };
  
    const normalized: Record<string, any> = {};
    for (const key in data) {
      normalized[mapping[key] || key] = data[key];
    }
    return normalized;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.replace(/_/g, ' ')}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col} className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {formatValue(item[col])}
                </td>
              ))}
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload('json', item)}>
                      Download JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('csv', item)}>
                      Download CSV
                    </DropdownMenuItem>
                    {onExplain && (
                      <DropdownMenuItem
                        onClick={() => {                       
                          onExplain(normalizeKeys(item));
                        }}
                      >
                        Explain
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataGrid;
