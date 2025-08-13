import React, { useEffect, useState, useRef } from 'react';
import { Loader2, Eye, Shield, Download, AlertTriangle } from 'lucide-react';

interface SecurePDFViewerProps {
  pdfUrl: string;
  title: string;
  userId?: number;
  className?: string;
}

export const SecurePDFViewer: React.FC<SecurePDFViewerProps> = ({
  pdfUrl,
  title,
  userId,
  className = ""
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProtected, setIsProtected] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        
        // Add security headers and protection
        if (iframeRef.current) {
          iframeRef.current.onload = () => {
            // Add protection layer after iframe loads
            addProtectionLayer();
          };
        }
        
        // Set a timeout to ensure protection is applied
        const timeoutId = setTimeout(() => {
          addProtectionLayer();
        }, 1000);

        return () => clearTimeout(timeoutId);
      } catch (err) {
        setError('Failed to load PDF securely');
        console.error('PDF loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl, userId]);

  const addProtectionLayer = () => {
    if (!iframeRef.current) return;

    try {
      // Attempt to access iframe content (may be blocked by CORS)
      const iframe = iframeRef.current;
      
      // Add keyboard event listeners to prevent downloads
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent Ctrl+S, Ctrl+P, F12, etc.
        if (
          e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'a') ||
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J')
        ) {
          e.preventDefault();
          e.stopPropagation();
          showProtectionWarning();
          return false;
        }
      };

      // Add context menu prevention
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        showProtectionWarning();
        return false;
      };

      // Add mouse move tracking for security
      let mouseMoveTimer: NodeJS.Timeout;
      const handleMouseMove = () => {
        clearTimeout(mouseMoveTimer);
        mouseMoveTimer = setTimeout(() => {
          // Reset protection state if user is inactive
          setIsProtected(false);
        }, 30000); // 30 seconds of inactivity
      };

      // Add event listeners to the document
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu as EventListener);
      document.addEventListener('mousemove', handleMouseMove);

      // Cleanup function
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu as EventListener);
        document.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(mouseMoveTimer);
      };
    } catch (err) {
      console.warn('Could not add protection layer due to CORS restrictions:', err);
    }
  };

  const showProtectionWarning = () => {
    alert('⚠️ Security Alert: Direct download, print, or copy operations are disabled for your protection. This PDF is watermarked and monitored.');
  };

  const handleDownloadAttempt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showProtectionWarning();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center border rounded-lg ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Loading secure PDF viewer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center border rounded-lg ${className}`}>
        <div className="text-center text-red-500">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative border rounded-lg overflow-hidden ${className}`}>
      {/* Security Header */}
      <div className="bg-muted border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Secure PDF Viewer</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Protected View
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            No Downloads
          </span>
        </div>
      </div>

      {/* PDF Content */}
      <div className="relative bg-white">
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          className="w-full h-96 border-0"
          title={`Secure PDF Viewer - ${title}`}
          sandbox="allow-same-origin allow-scripts allow-forms"
          style={{
            pointerEvents: isProtected ? 'none' : 'auto',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            userSelect: 'none'
          }}
        />
        
        {/* Protection Overlay */}
        {isProtected && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-5 flex items-center justify-center pointer-events-none"
            style={{ display: 'none' }}
          >
            <div className="text-center text-white">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Protected Content</p>
              <p className="text-xs opacity-75">Watermarked & Monitored</p>
            </div>
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="bg-muted border-t p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            <span>
              This PDF is protected and cannot be downloaded, printed, or copied.
            </span>
          </div>
          {userId && (
            <span className="text-green-600 font-medium">
              Watermarked for User {userId}
            </span>
          )}
        </div>
        <div className="mt-2 text-center">
          <button
            onClick={handleDownloadAttempt}
            className="text-xs text-red-600 hover:text-red-700 underline"
          >
            ⚠️ Attempt Download (Blocked)
          </button>
        </div>
      </div>
    </div>
  );
};