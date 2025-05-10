
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface AnalyticsFiltersProps {
  onFilterChange: (filters: {
    namespace: string;
    status: string;
    nodeName: string;
    label: string;
    searchQuery: string;
  }) => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({ onFilterChange }) => {
  const [namespace, setNamespace] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [nodeName, setNodeName] = useState<string>('all');
  const [label, setLabel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const handleApplyFilters = () => {
    onFilterChange({
      namespace,
      status,
      nodeName,
      label,
      searchQuery
    });
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      <div className="text-sm font-medium mb-3">Filters</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-1">
          <label htmlFor="namespace" className="text-xs text-gray-500">Namespace</label>
          <Select value={namespace} onValueChange={setNamespace}>
            <SelectTrigger id="namespace">
              <SelectValue placeholder="Select namespace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Namespaces</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="kube-system">Kube System</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="status" className="text-xs text-gray-500">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="node" className="text-xs text-gray-500">Node</label>
          <Select value={nodeName} onValueChange={setNodeName}>
            <SelectTrigger id="node">
              <SelectValue placeholder="Select node" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Nodes</SelectItem>
              <SelectItem value="node-1">Node 1</SelectItem>
              <SelectItem value="node-2">Node 2</SelectItem>
              <SelectItem value="node-3">Node 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="label" className="text-xs text-gray-500">Label</label>
          <Select value={label} onValueChange={setLabel}>
            <SelectTrigger id="label">
              <SelectValue placeholder="Select label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              <SelectItem value="app">app</SelectItem>
              <SelectItem value="tier">tier</SelectItem>
              <SelectItem value="env">environment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="search" className="text-xs text-gray-500">Search</label>
          <div className="flex">
            <Input
              id="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-r-none"
            />
            <Button 
              type="submit" 
              variant="default" 
              size="icon" 
              className="rounded-l-none" 
              onClick={handleApplyFilters}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
