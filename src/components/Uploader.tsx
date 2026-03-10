"use client";

import { useState, useRef, useCallback } from "react";
import { uploadMediaAction } from "@/actions/media";

interface UploaderProps {
  albumId: string;
  onSuccess?: () => void;
}

interface UploadStatus {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function Uploader({ albumId, onSuccess }: UploaderProps) {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (newFiles.length === 0) return;

    const newUploads: UploadStatus[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      progress: 0,
      status: 'pending'
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Process one by one for stability, but we update the UI for all
    for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const statusItem = newUploads[i];

        setUploads(prev => prev.map(u => u.id === statusItem.id ? { ...u, status: 'uploading', progress: 10 } : u));

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await uploadMediaAction(albumId, formData);
            if (res?.error) {
                setUploads(prev => prev.map(u => u.id === statusItem.id ? { ...u, status: 'error', error: res.error } : u));
            } else {
                setUploads(prev => prev.map(u => u.id === statusItem.id ? { ...u, status: 'success', progress: 100 } : u));
            }
        } catch (err) {
            setUploads(prev => prev.map(u => u.id === statusItem.id ? { ...u, status: 'error', error: "Error de conexión" } : u));
        }
    }

    // After all are done, trigger refresh if at least one succeeded
    // onSuccess is usually just router.refresh()
    onSuccess?.();
    
    // Clear successes after a few seconds
    setTimeout(() => {
        setUploads(prev => prev.filter(u => u.status === 'error' || u.status === 'uploading'));
    }, 5000);
  }, [albumId, onSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        processFiles(e.target.files);
        e.target.value = ""; // Reset
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const activeUploads = uploads.filter(u => u.status === 'uploading' || u.status === 'pending').length;
  const isBusy = activeUploads > 0;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button 
           className="btn-primary"
           onClick={() => fileInputRef.current?.click()}
           disabled={isBusy}
           style={{ flex: 1, minWidth: "200px", padding: "1rem" }}
        >
          📁 Seleccionar Archivos
        </button>
        <button 
           className="btn-secondary"
           onClick={() => cameraInputRef.current?.click()}
           disabled={isBusy}
           style={{ flex: 1, minWidth: "200px", padding: "1rem" }}
        >
          📸 {typeof window !== 'undefined' && window.innerWidth < 768 ? 'Usar Cámara' : 'Tomar Foto'}
        </button>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? "var(--secondary)" : "var(--primary)"}`,
          background: isDragging ? "var(--primary-light)" : "rgba(255,255,255,0.03)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          textAlign: "center",
          transition: "var(--transition)",
          cursor: isBusy ? "wait" : "pointer",
          position: "relative",
          marginBottom: "1rem"
        }}
        onClick={() => !isBusy && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          multiple
          accept="image/*,video/*" 
          style={{ display: "none" }} 
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isBusy}
        />
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          style={{ display: "none" }} 
          ref={cameraInputRef}
          onChange={handleFileChange}
          disabled={isBusy}
        />

        <div style={{ scale: isDragging ? "1.05" : "1", transition: "var(--transition)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            {isDragging ? "🎯" : "➕"}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            {isDragging ? "¡Suéltalos ahora!" : "O arrastra tus carpetas y archivos aquí"}
          </p>
        </div>
      </div>

      {/* Upload Status List */}
      {uploads.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {uploads.map(u => (
            <div key={u.id} className="glass-panel" style={{ 
                padding: "0.75rem 1rem", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                fontSize: "0.85rem",
                borderLeft: `4px solid ${
                    u.status === 'success' ? '#10b981' : 
                    u.status === 'error' ? '#ef4444' : 
                    'var(--primary)'
                }`
            }}>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: "1rem" }}>
                {u.name}
              </div>
              <div style={{ fontWeight: 600 }}>
                {u.status === 'uploading' && `🚀 ${u.progress}%`}
                {u.status === 'pending' && `⌛ Pendiente`}
                {u.status === 'success' && `✅ Listo`}
                {u.status === 'error' && `⚠️ Error`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
