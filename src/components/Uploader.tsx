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

    onSuccess?.();
    
    setTimeout(() => {
        setUploads(prev => prev.filter(u => u.status === 'error' || u.status === 'uploading'));
    }, 5000);
  }, [albumId, onSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        processFiles(e.target.files);
        e.target.value = ""; 
    }
  };

  const activeUploads = uploads.filter(u => u.status === 'uploading' || u.status === 'pending').length;
  const isBusy = activeUploads > 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-3">
         <i className="fas fa-images"></i> Agregar fotos o recuerdos
      </h2>
      
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {/* Left: Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) processFiles(e.dataTransfer.files); }}
          onClick={() => !isBusy && fileInputRef.current?.click()}
          style={{
            flex: 1,
            minWidth: "250px",
            border: `3px dashed ${isDragging ? "var(--primary)" : "var(--border-dashed)"}`,
            background: isDragging ? "var(--primary-light)" : "var(--bg-color)",
            borderRadius: "var(--radius-md)",
            padding: "3rem 1rem",
            textAlign: "center",
            transition: "var(--transition)",
            cursor: isBusy ? "wait" : "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <input 
            type="file" multiple accept="image/*,video/*" 
            style={{ display: "none" }} ref={fileInputRef} onChange={handleFileChange} disabled={isBusy}
          />
          <i className="fas fa-cloud-upload-alt text-5xl text-amber-500 mb-4"></i>
          <p style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Arrastra y suelta fotos aquí
          </p>
          <p style={{ color: "var(--text-muted)", opacity: 0.7, margin: "0.5rem 0" }}>o</p>
          <button className="btn-primary" style={{ padding: "0.5rem 1.5rem" }}>
            Seleccionar archivos
          </button>
        </div>

        {/* Right: Grid Actions */}
        <div style={{ flex: 1, minWidth: "250px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <button 
             className="btn-secondary"
             onClick={() => cameraInputRef.current?.click()}
             disabled={isBusy}
             style={{ flexDirection: "column", height: "auto", padding: "1.5rem" }}
          >
            <i className="fas fa-camera text-3xl mb-2"></i>
            <span>Tomar foto</span>
            <input 
              type="file" accept="image/*" capture="environment"
              style={{ display: "none" }} ref={cameraInputRef} onChange={handleFileChange} disabled={isBusy}
            />
          </button>
          
          <button className="btn-secondary" style={{ flexDirection: "column", height: "auto", padding: "1.5rem" }}>
            <i className="fas fa-link text-3xl mb-2"></i>
            <span>Importar URL</span>
          </button>

          <button className="btn-secondary" style={{ flexDirection: "column", height: "auto", padding: "1.5rem" }}>
            <i className="fab fa-google-drive text-3xl mb-2"></i>
            <span>Google Drive</span>
          </button>

          <button className="btn-secondary" style={{ flexDirection: "column", height: "auto", padding: "1.5rem" }}>
            <i className="fas fa-folder-open text-3xl mb-2"></i>
            <span>Álbum existente</span>
          </button>
        </div>
      </div>

      {/* Upload Status List */}
      {uploads.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
          {uploads.map(u => (
            <div key={u.id} className="glass-panel" style={{ 
                padding: "1rem", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                borderLeftWidth: "6px",
                borderColor: u.status === 'success' ? '#10b981' : u.status === 'error' ? '#ef4444' : 'var(--primary)'
            }}>
              <div style={{ fontWeight: 600, flex: 1 }}>{u.name}</div>
              <div style={{ fontWeight: 800 }}>
                {u.status === 'uploading' && <><i className="fas fa-spinner fa-spin mr-2"></i> {u.progress}%</>}
                {u.status === 'pending' && <><i className="fas fa-clock mr-2"></i> Esperando</>}
                {u.status === 'success' && <><i className="fas fa-check-circle text-green-500 mr-2"></i> Completado</>}
                {u.status === 'error' && <><i className="fas fa-exclamation-triangle text-red-500 mr-2"></i> Error</>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
