
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string | null;
  isLoading: boolean;
  podData?: any;
}

const ExplainModal: React.FC<ExplainModalProps> = ({
  isOpen,
  onClose,
  explanation,
  isLoading,
  podData,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Pod Explanation
            {podData && podData.pod && <span className="ml-2 text-kubernetes-purple">{podData.pod}</span>}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 h-[60vh]">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-kubernetes-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
              </div>
            ) : explanation ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{explanation}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-center">No explanation available</p>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExplainModal;
