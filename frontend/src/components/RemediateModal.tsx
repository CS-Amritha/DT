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


interface RemediateModalProps {
  isOpen: boolean;
  onClose: () => void;
  remediation: string | null;
  isPlanning: boolean;
  resourceData: any;
  onApply: () => void;
  remediationId: string | null;
}
// Utility to clean up excessive newlines
const cleanMarkdown = (text: string) =>
  text.replace(/\n{2,}/g, '\n\n').trim();

const RemediateModal: React.FC<RemediateModalProps> = ({
  isOpen,
  onClose,
  remediation,
  isPlanning,
  resourceData,
  onApply,
  remediationId, 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
        <DialogTitle>
            {resourceData?.pod
                ? 'Pod Remediation'
                : resourceData?.node_name
                ? 'Node Remediation'
                : 'Remediation'}

            {(resourceData?.pod || resourceData?.node_name) && (
                <span className="ml-2 text-kubernetes-purple">
                {resourceData?.pod || resourceData?.node_name}
                </span>
            )}
        </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 h-[60vh]">
          <div className="p-4">
            {isPlanning ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-kubernetes-purple border-r-transparent" />
                <p className="text-sm text-gray-500">KubeBoom is Planning...</p>
              </div>
            ) : remediation ? (
              <div className="prose prose-sm max-w-none prose-headings:mt-4 prose-p:mt-2 prose-li:my-1 text-gray-800 whitespace-pre-wrap">
                <ReactMarkdown>{cleanMarkdown(remediation)}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500 text-center">No remediation available</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
          {!isPlanning && remediation && remediationId && (
          <Button onClick={onApply} className="bg-green-600 hover:bg-green-700 text-white">
          Apply Remediation
          </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    );
};
export default RemediateModal;