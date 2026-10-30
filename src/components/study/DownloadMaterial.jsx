import React from 'react';
import { Download } from 'lucide-react';

export default function DownloadMaterial({ content, filename, label = 'Download' }) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="select-none inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-study-dark text-white hover:bg-study-accent-dark transition-colors"
    >
      <Download size={16} className="select-none" />
      {label}
    </button>
  );
}