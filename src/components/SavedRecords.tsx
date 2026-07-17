/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, Trash2, ChevronRight, Calendar } from 'lucide-react';
import { MedicalRecord } from '../types';

interface SavedRecordsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (record: MedicalRecord) => void;
  inline?: boolean;
}

export const SavedRecords: React.FC<SavedRecordsProps> = ({ isOpen, onClose, onSelect, inline = false }) => {
  const [records, setRecords] = React.useState<any[]>([]);

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_records') || '[]');
    setRecords(saved.sort((a: any, b: any) => b.id - a.id));
  }, [isOpen]);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem('saved_records', JSON.stringify(filtered));
    setRecords(filtered);
  };

  const Content = (
    <div className={`${inline ? '' : 'flex-1 overflow-y-auto p-4 space-y-4'}`}>
      {records.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Chưa có bản ghi nào được lưu</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <motion.div
              key={record.id}
              layout
              onClick={() => {
                onSelect(record);
                if (!inline) onClose();
              }}
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {record.fullName || 'Chưa đặt tên'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(record.savedAt).toLocaleString('vi-VN')}
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-500 line-clamp-1">
                    Khoa: {record.title || 'N/A'} • Chẩn đoán: {record.diagnosisCurrent || 'N/A'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleDelete(record.id, e)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  if (inline) return Content;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-black text-slate-800">LỊCH SỬ ĐÃ LƯU</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            {Content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
