import React from 'react';
import Modal from './Modal';
import { AlertCircle } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function AlertDialog({ isOpen, message, onClose }: AlertDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="提示">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-gray-700 mb-4">{message}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}