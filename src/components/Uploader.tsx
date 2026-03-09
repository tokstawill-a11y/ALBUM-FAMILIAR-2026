"use client";

import { useState, useRef, useCallback } from "react";
import { uploadMediaAction } from "@/actions/media";

interface UploaderProps {
  albumId: string;
  onSuccess?: () => void;
}

export default function Uploader({ albumId, onSuccess }: UploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startUpload = useCallback(async (file: File) => {
    if (!file) return;
    
    // Basic validation
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError("Solo se permiten imágenes y videos.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(10); // Start progress

    const formData = new FormData();
    formData.append("file", file);
    
    try {
      // Simulate progress since Server Actions don't support native progress yet
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 300);

      const res = await uploadMediaAction(albumId, formData);
      
      clearInterval(interval);
      setUploadProgress(100);

      if (res?.error) {
        setError(res.error);
        setUploadProgress(0);
      } else {
        // Short delay to show 100% before closing
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      }
    } catch (err) {
      setError("Error inesperado en la subida.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [albumId, onSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) startUpload(file);
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
    const file = e.dataTransfer.files?.[0];
    if (file) startUpload(file);
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? "var(--secondary)" : "var(--primary)"}`,
          background: isDragging ? "var(--primary-light)" : "rgba(255,255,255,0.05)",
          borderRadius: "var(--radius-lg)",
          padding: "3rem 2rem",
          textAlign: "center",
          transition: "var(--transition)",
          cursor: isUploading ? "wait" : "pointer",
          position: "relative",
          overflow: "hidden"
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          accept="image/*,video/*" 
          style={{ display: "none" }} 
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <div style={{ scale: isDragging ? "1.1" : "1", transition: "var(--transition)" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
            {isUploading ? "⌛" : isDragging ? "🎯" : "📤"}
          </div>
          <h4 style={{ marginBottom: "0.5rem", color: "var(--text-main)" }}>
            {isUploading ? "Subiendo tu recuerdo..." : isDragging ? "¡Suéltalo aquí!" : "Haz clic o arrastra un archivo"}
          </h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Imágenes o Videos (Max 10MB)
          </p>
        </div>

        {/* Progress bar */}
        {isUploading && (
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "4px",
            background: "linear-gradient(90deg, var(--primary), var(--secondary))",
            width: `${uploadProgress}%`,
            transition: "width 0.3s ease"
          }} />
        )}
      </div>

      {error && (
        <div style={{ 
          marginTop: "1rem", 
          padding: "0.75rem", 
          borderRadius: "var(--radius-sm)", 
          background: "var(--error)", 
          color: "white",
          fontSize: "0.85rem",
          textAlign: "center"
        }}>
          ⚠️ {error}
        </div>
      )}

      {isUploading && (
        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Estamos procesando tu archivo, no cierres esta ventana.
        </p>
      )}
    </div>
  );
}
