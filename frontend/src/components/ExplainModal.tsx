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
import ReactMarkdown from 'react-markdown';

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string | null;
  isLoading: boolean;
  podData?: any;
}

// Utility to clean up excessive newlines
const cleanMarkdown = (text: string) =>
  text.replace(/\n{2,}/g, '\n\n').trim();

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
            {podData?.pod && (
              <span className="ml-2 text-kubernetes-purple">{podData.pod}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[60vh]">
          <div className="p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-kubernetes-purple border-r-transparent" />
                <p className="text-sm text-gray-500">KubeBoom is Thinking...</p>
              </div>
            ) : explanation ? (
              <div className="prose prose-sm max-w-none prose-headings:mt-4 prose-p:mt-2 prose-li:my-1 text-gray-800 whitespace-pre-wrap">
                <ReactMarkdown>{cleanMarkdown(explanation)}</ReactMarkdown>
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
