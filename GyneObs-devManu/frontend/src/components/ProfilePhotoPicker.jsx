import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, RefreshCw, X, Save, User } from 'lucide-react';
import { uploadService } from '../services/api';
import { extractFotoUrl } from '../utils/photo';

/**
 * Selector de foto de perfil: subir archivo o usar cámara.
 * value = URL actual; onChange(url) al subir con éxito.
 */
const ProfilePhotoPicker = ({
  value = null,
  onChange,
  disabled = false,
  size = 95,
  label = 'Foto de perfil',
}) => {
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const displayUrl = localPreview || value;

  useEffect(() => {
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    };
  }, [cameraStream]);

  const uploadFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5 MB');
      return;
    }
    setUploading(true);
    try {
      const res = await uploadService.uploadProfilePhoto(file);
      const url = extractFotoUrl(res);
      if (!url) throw new Error('No se recibió la URL');
      setLocalPreview(url);
      onChange?.(url);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const startCamera = () => {
    setCapturedPhoto(null);
    setShowCamera(true);
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 480, facingMode: 'user' },
          audio: false,
        });
        setCameraStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        alert('No se pudo activar la cámara. Verifica los permisos.');
        setShowCamera(false);
      }
    }, 300);
  };

  const stopCamera = () => {
    if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    setShowCamera(false);
    setCapturedPhoto(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedPhoto({ file, preview: URL.createObjectURL(blob) });
      }
    }, 'image/jpeg', 0.95);
  };

  const useCapturedPhoto = async () => {
    if (capturedPhoto?.file) {
      stopCamera();
      await uploadFile(capturedPhoto.file);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
        {label && (
          <label style={{ marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
            {label}
          </label>
        )}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: displayUrl
              ? 'none'
              : 'linear-gradient(135deg, var(--primary-pink), var(--primary-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '3px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            position: 'relative',
          }}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Perfil"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={size * 0.45} color="white" />
          )}
          {uploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <RefreshCw className="animate-spin" size={24} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            <Upload size={14} /> Subir
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={startCamera}
            disabled={disabled || uploading}
          >
            <Camera size={14} /> Cámara
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {showCamera && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              padding: 24,
              maxWidth: 450,
              width: '100%',
              background: 'white',
              borderRadius: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>Tomar foto</h4>
              <button type="button" onClick={stopCamera} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                aspectRatio: 1,
                background: '#111',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              {!capturedPhoto ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
              ) : (
                <img src={capturedPhoto.preview} alt="Captura" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {!capturedPhoto ? (
                <>
                  <button type="button" className="btn btn-secondary" onClick={stopCamera}>
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={capturePhoto}>
                    <Camera size={16} /> Capturar
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => setCapturedPhoto(null)}>
                    Repetir
                  </button>
                  <button type="button" className="btn btn-primary" onClick={useCapturedPhoto} disabled={uploading}>
                    <Save size={16} /> Usar foto
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePhotoPicker;
