"use client";
import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useUploadImage } from '@/hooks/useUpload';

export default function CustomizationUpload({ 
  value, 
  onChange,
  label = "Upload de imagem para personalização"
}) {
  const [preview, setPreview] = useState(null);
  const uploadImage = useUploadImage();

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Apenas arquivos JPG, PNG e WEBP são permitidos.');
      return;
    }

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('O tamanho máximo permitido é 10MB.');
      return;
    }

    // Criar preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const result = await uploadImage.mutateAsync({ 
        file, 
        folder: 'personalizarte/customizations' 
      });
      
      onChange(result.url);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem.');
      setPreview(null);
    }
  }, [uploadImage, onChange]);

  const handleRemove = () => {
    setPreview(null);
    onChange('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  }, [handleFileSelect]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold mb-2">{label}</label>
      
      {!value && !preview ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
        >
          <input
            type="file"
            id="customization-upload"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="customization-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Arraste uma imagem aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-400">
              JPG, PNG, WEBP (máx. 10MB)
            </p>
          </label>
        </div>
      ) : (
        <div className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
            <img
              src={preview || value}
              alt="Preview da personalização"
              className="w-full h-full object-cover"
            />
          </div>
          
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
            title="Remover"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {uploadImage.isPending && (
        <div className="text-center text-gray-500">
          Fazendo upload...
        </div>
      )}
    </div>
  );
}
