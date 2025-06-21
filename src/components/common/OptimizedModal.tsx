
import React, { memo, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface OptimizedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const OptimizedModal = memo(({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  className
}: OptimizedModalProps) => {
  // Memoizar o handler de close para evitar re-renders
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Controlar o escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, handleClose]);

  // Definir tamanhos
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeOnOverlayClick ? handleClose : undefined}>
      <DialogContent className={`${sizeClasses[size]} ${className || ''}`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
});

OptimizedModal.displayName = 'OptimizedModal';

export { OptimizedModal };
