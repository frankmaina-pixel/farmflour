import React from 'react';
import { Separator } from '@/components/ui/separator';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-card/50">
      <div className="container mx-auto px-4 py-6">
        <Separator className="mb-4" />
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Farm Flour Manager. All rights reserved.
          </div>
          <div className="text-xs text-muted-foreground">
            Powered by Frank Maina
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center sm:text-left">
          Unauthorized reproduction or distribution of this software is strictly prohibited.
        </div>
      </div>
    </footer>
  );
};
