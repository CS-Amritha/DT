
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, Check, Wrench } from "lucide-react";

export interface RemediationHistoryItem {
  id: string;
  resourceName: string;
  resourceNamespace: string;
  timestamp: string;
  status: 'success' | 'failed';
  issue: string;
  action: string;
}

interface RemediationHistoryTableProps {
  data: RemediationHistoryItem[];
  resourceType: 'pods' | 'nodes';
  onRemediate?: (resource: { name: string; issue: string }) => void;
}

const RemediationHistoryTable: React.FC<RemediationHistoryTableProps> = ({ 
  data,
  resourceType,
  onRemediate
}) => {
  const [sortField, setSortField] = useState<'timestamp' | 'status'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  
  const toggleSort = (field: 'timestamp' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Filter and sort the data
  const filteredData = data
    .filter(item => filter === 'all' ? true : item.status === filter)
    .sort((a, b) => {
      if (sortField === 'timestamp') {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else {
        // status sorting
        const order = sortDirection === 'asc' ? 1 : -1;
        return a.status === 'success' && b.status !== 'success' ? -1 * order : 
               a.status !== 'success' && b.status === 'success' ? 1 * order : 0;
      }
    });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleRemediate = (item: RemediationHistoryItem) => {
    if (onRemediate) {
      onRemediate({
        name: item.resourceName,
        issue: item.issue
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">
            Remediation History
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource Name</TableHead>
                  <TableHead>Namespace</TableHead>
                  <TableHead className="hidden md:table-cell">Issue</TableHead>
                  <TableHead className="hidden md:table-cell">Action</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                    <div className="flex items-center">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('timestamp')}>
                    <div className="flex items-center">
                      Time
                      {sortField === 'timestamp' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </TableHead>
                  {onRemediate && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.resourceName}</TableCell>
                    <TableCell>{item.resourceNamespace}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.issue}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.action}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'success' ? 'default' : 'destructive'} className="justify-center gap-1">
                        {item.status === 'success' && <Check size={12} />}
                        {item.status === 'success' ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(item.timestamp)}</TableCell>
                    {onRemediate && (
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemediate(item)}
                          className="h-8 px-2 text-xs"
                        >
                          <Wrench className="h-3.5 w-3.5 mr-1" />
                          Remediate
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            No remediation history available for {resourceType}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RemediationHistoryTable;
