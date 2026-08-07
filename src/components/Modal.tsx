import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <Card
        level={2}
        roundedSize="lg"
        className="relative z-10 w-full max-w-lg bg-brand-card-bg border border-brand-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <h2 className="headline-sm text-brand-primary">{title}</h2>
          <Button variant="ghost" onClick={onClose} className="p-1 hover:bg-neutral-100 dark:hover:bg-brand-border/30 rounded-md">
            <X className="h-4 w-4 text-brand-secondary" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
      </Card>
    </div>
  );
};
