import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import useFileUpload from '../../hooks/useFileUpload';

export default function FileUploader() {
  const { isReading, handleFileUpload } = useFileUpload();
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFileUpload(event.dataTransfer.files?.[0] || null);
  };

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Upload file</span>
      <div className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 transition hover:border-cyan/40 hover:bg-cyan/5">
        <div
          className={`absolute inset-0 rounded-2xl border border-cyan/30 transition ${dragActive ? 'bg-cyan/10 opacity-100' : 'opacity-0'}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        />
        <div>
          <p className="text-sm font-medium text-text-primary">{isReading ? 'Reading file...' : 'Drop a file or click to browse'}</p>
          <p className="mt-1 text-xs text-text-secondary">Supports common source files and auto-detects language from filename.</p>
        </div>
        <UploadCloud className="h-5 w-5 text-cyan transition group-hover:scale-110" />
        <input
          aria-label="Upload a code file"
          type="file"
          className="sr-only"
          accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.cc,.cxx,.c,.cs,.go,.rs,.php,.rb,.kt,.swift,.sql,.html,.css,.sh,.bash,.dart,.scala,.lua,.yml,.yaml"
          onChange={(event) => handleFileUpload(event.target.files?.[0] || null)}
        />
      </div>
    </label>
  );
}
