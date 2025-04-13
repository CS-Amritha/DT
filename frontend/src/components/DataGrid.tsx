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

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, itemIndex) => (
            <React.Fragment key={itemIndex}>
              {Object.entries(item).map(([key, value], entryIndex) => (
                <tr 
                  key={`${itemIndex}-${key}`}
                  className={entryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {key}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-md truncate">
                    {formatValue(value)}
                  </td>
                  {entryIndex === 0 && (
                    <td 
                      className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium"
                      rowSpan={Object.keys(item).length}
                    >
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
                          {isPods && onExplain && (
                            <DropdownMenuItem onClick={() => onExplain(item)}>
                              Explain
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                  {entryIndex !== 0 && null}
                </tr>
              ))}
              <tr className="h-2"><td colSpan={3}></td></tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataGrid;
