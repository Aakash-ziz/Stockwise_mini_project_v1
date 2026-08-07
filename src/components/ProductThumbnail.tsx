import React from 'react';
import { 
  Keyboard, 
  Laptop, 
  Mouse, 
  Monitor, 
  FileText, 
  Maximize2,
  HelpCircle
} from 'lucide-react';

interface ProductThumbnailProps {
  type?: string;
  color: string;
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({ type, color }) => {
  const iconClass = "h-5 w-5 text-brand-secondary";
  let IconNode = HelpCircle;

  if (type === 'keyboard') IconNode = Keyboard;
  else if (type === 'laptop') IconNode = Laptop;
  else if (type === 'mouse') IconNode = Mouse;
  else if (type === 'monitor') IconNode = Monitor;
  else if (type === 'mat') IconNode = FileText;
  else if (type === 'stand') IconNode = Maximize2;

  return (
    <div 
      className="h-12 w-12 rounded border border-brand-border flex items-center justify-center select-none"
      style={{ backgroundColor: color }}
    >
      <IconNode className={iconClass} />
    </div>
  );
};
