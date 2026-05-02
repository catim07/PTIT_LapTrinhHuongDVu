import React, { useState } from 'react';

interface ReviewReplyFormProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

const ReviewReplyForm: React.FC<ReviewReplyFormProps> = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length === 0) return;
    onSubmit(text);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 animate-fade-in">
      <h5 className="text-sm font-bold mb-2">Trả lời đánh giá</h5>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-primary resize-y bg-white dark:bg-slate-900 min-h-[80px]"
        placeholder="Nhập nội dung trả lời (tối đa 500 ký tự)..."
        maxLength={500}
        aria-label="Reply input"
      />
      <div className="flex justify-end gap-2 mt-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          Hủy
        </button>
        <button 
          type="submit"
          disabled={text.trim().length === 0}
          className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          Gửi
        </button>
      </div>
    </form>
  );
};

export default ReviewReplyForm;
