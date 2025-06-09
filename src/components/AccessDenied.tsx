import React from 'react';

interface AccessDeniedProps {
  isVisible: boolean;
  onClose: () => void;
  restrictedPage: string;
  allowedUsers: string[];
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  isVisible, 
  onClose, 
  restrictedPage, 
  allowedUsers 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Main popup */}
      <div className="relative bg-tech-card border border-tech-border rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100 animate-bounce-in">
        {/* Header gradient */}
        <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-t-xl"></div>
        
        <div className="p-8 text-center">
          {/* Lock icon with pulse animation */}
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <svg 
              className="w-8 h-8 text-red-600 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Access Restricted
          </h2>
          
          {/* Message */}
          <p className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
            The <span className="font-semibold text-accent">{restrictedPage}</span> page is restricted to authorized users only.
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Authorized users: <span className="font-medium text-accent">{allowedUsers.join(', ')}</span>
          </p>
          
          {/* Contact info */}
          <div className="bg-tech-secondary bg-opacity-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              💡 Need access? Contact an administrator to request permissions.
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
            
            <button
              onClick={() => window.location.href = 'mailto:admin@truerankdigital.com?subject=Stats Page Access Request'}
              className="px-6 py-2 bg-accent hover:bg-accent-light text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Request Access
            </button>
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-tech-border">
            <p className="text-xs text-gray-500">
              🔒 True Rank Digital Security Policy
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3) translate(-50%, -50%);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translate(-50%, -50%);
          }
          70% {
            transform: scale(0.9) translate(-50%, -50%);
          }
          100% {
            transform: scale(1) translate(-50%, -50%);
            opacity: 1;
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AccessDenied; 