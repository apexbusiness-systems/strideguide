import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';

interface ActionPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data?: any) => void;
  type: 'confirmation' | 'input' | 'hazard-report' | 'emergency-setup';
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'info' | 'warning' | 'critical';
  isPremium?: boolean;
}

export const ActionPromptModal: React.FC<ActionPromptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'info',
  isPremium = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  const getIcon = () => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      default:
        return <Info className="h-6 w-6 text-primary" />;
    }
  };

  const getHeaderClass = () => {
    switch (severity) {
      case 'critical':
        return 'border-destructive bg-destructive/5';
      case 'warning':
        return 'border-warning bg-warning/5';
      default:
        return 'border-primary bg-primary/5';
    }
  };

  const handleConfirm = () => {
    let data = {};
    
    switch (type) {
      case 'input':
        data = { value: inputValue };
        break;
      case 'hazard-report':
        data = { 
          description: textareaValue,
          location: inputValue 
        };
        break;
      case 'emergency-setup':
        data = {
          contactName: inputValue,
          notes: textareaValue
        };
        break;
    }

    onConfirm(data);
    setInputValue('');
    setTextareaValue('');
  };

  const handleClose = () => {
    setInputValue('');
    setTextareaValue('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className={`rounded-lg p-4 border ${getHeaderClass()}`}>
          <div className="flex items-center gap-3">
            {getIcon()}
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                {title}
                {isPremium && (
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type === 'input' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Enter value:
              </label>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type here..."
                className="w-full"
                autoFocus
              />
            </div>
          )}

          {type === 'hazard-report' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Location:
                </label>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g., Main St & 1st Ave"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description:
                </label>
                <Textarea
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  placeholder="Describe the hazard..."
                  className="w-full min-h-[80px]"
                  autoFocus
                />
              </div>
            </div>
          )}

          {type === 'emergency-setup' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Contact Name:
                </label>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Emergency contact name"
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Additional Notes:
                </label>
                <Textarea
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  placeholder="Special instructions or medical info..."
                  className="w-full min-h-[80px]"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            {cancelText}
          </Button>
          <Button 
            onClick={handleConfirm}
            variant={severity === 'critical' ? 'destructive' : 'default'}
            disabled={
              (type === 'input' && !inputValue.trim()) ||
              (type === 'hazard-report' && !textareaValue.trim()) ||
              (type === 'emergency-setup' && !inputValue.trim())
            }
          >
            {severity === 'critical' && <AlertTriangle className="h-4 w-4 mr-2" />}
            {severity === 'info' && confirmText === 'Confirm' && <CheckCircle className="h-4 w-4 mr-2" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};