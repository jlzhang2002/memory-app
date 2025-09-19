import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { MessageSquare } from 'lucide-react';

interface PromptDialogProps {
  isOpen: boolean;
  message: string;
  initialValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function PromptDialog({ 
  isOpen, 
  message, 
  initialValue = '', 
  placeholder = '',
  onConfirm, 
  onCancel 
}: PromptDialogProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onConfirm(value.trim());
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="输入信息">
      <div className="flex items-start gap-3">
        <MessageSquare className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-gray-700 mb-4">{message}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!value.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确定
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}