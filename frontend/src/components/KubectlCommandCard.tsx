
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";

interface KubectlCommandCardProps {
  resourceType: 'pods' | 'nodes';
  count: number;
}

const KubectlCommandCard: React.FC<KubectlCommandCardProps> = ({ resourceType, count }) => {
  // Generate a common kubectl command for the resource type
  const getCommand = () => {
    if (resourceType === 'pods') {
      return 'kubectl get pods --all-namespaces -o wide';
    } else {
      return 'kubectl describe nodes';
    }
  };
  
  const countText = count > 0 
    ? `${count} actions performed` 
    : "No actions yet";
    
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Quick Commands</CardTitle>
        <CardDescription>Common kubectl operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Terminal size={18} className="text-muted-foreground" />
          <span className="text-sm">{countText}</span>
        </div>
        
        <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto">
          {getCommand()}
        </div>
      </CardContent>
    </Card>
  );
};

export default KubectlCommandCard;
