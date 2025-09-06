import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  TrashIcon, 
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger", // danger, warning, info
  loading = false
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <TrashIcon className="w-12 h-12 text-error-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-12 h-12 text-warning-600" />;
      case 'info':
        return <ExclamationTriangleIcon className="w-12 h-12 text-primary-600" />;
      default:
        return <ExclamationTriangleIcon className="w-12 h-12 text-error-600" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-error-600 hover:bg-error-700 focus:ring-error-500';
      case 'warning':
        return 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500';
      case 'info':
        return 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500';
      default:
        return 'bg-error-600 hover:bg-error-700 focus:ring-error-500';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="admin-card max-w-md w-full text-center relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            {getIcon()}
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">
            {title}
          </h3>

          {/* Message */}
          <p className="text-neutral-600 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={loading}
              className="btn-outline flex-1 max-w-32"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`btn-primary flex-1 max-w-32 ${getConfirmButtonClass()}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="spinner w-4 h-4"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4" />
                  {confirmText}
                </div>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

