"use client";
import { useState, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useUploadImage } from '@/hooks/useUpload';
import api from '@/lib/api';

export default function ImageUpload({ 
  images = [], 
  onImagesChange, 
  productId,
  maxImages = 5 
}) {
  const [previews, setPreviews] = useState([]);
  const uploadImage = useUploadImage();

  // Carregar imagens existentes se productId for fornecido
  useEffect(() => {
    if (productId && images.length === 0) {
      loadExistingImages();
    }
  }, [productId]);

  const loadExistingImages = async () => {
    try {
      const response = await api.get(`/products/${productId}/images`);
      const formattedImages = response.data.map(img => ({
        url: img.url,
        isMain: img.isMain,
        position: img.position,
        id: img.id,
      }));
      onImagesChange(formattedImages);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    }
  };

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    
    // Validar tipos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      alert('Apenas arquivos JPG, PNG e WEBP são permitidos.');
      return;
    }

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024;
    const validSizeFiles = validFiles.filter(file => file.size <= maxSize);
    
    if (validSizeFiles.length !== validFiles.length) {
      alert('O tamanho máximo permitido é 10MB.');
      return;
    }

    // Validar quantidade máxima
    if (images.length + validSizeFiles.length > maxImages) {
      alert(`Máximo de ${maxImages} imagens permitidas.`);
      return;
    }

    // Upload de cada arquivo
    for (const file of validSizeFiles) {
      try {
        const result = await uploadImage.mutateAsync({ 
          file, 
          folder: 'personalizarte/products' 
        });
        
        const newImage = {
          url: result.url,
          isMain: images.length === 0, // Primeira imagem é principal
          position: images.length,
        };
        
        onImagesChange([...images, newImage]);
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        alert('Erro ao fazer upload da imagem.');
      }
    }
  }, [images, onImagesChange, uploadImage, maxImages]);

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleSetMain = (index) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    onImagesChange(newImages);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const event = { target: { files } };
    handleFileSelect(event);
  }, [handleFileSelect]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            Arraste imagens aqui ou clique para selecionar
          </p>
          <p className="text-sm text-gray-400">
            JPG, PNG, WEBP (máx. 10MB cada)
          </p>
          <p className="text-sm text-gray-400">
            Máximo {maxImages} imagens
          </p>
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={image.url}
                  alt={`Produto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {image.isMain && (
                <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {!image.isMain && (
                  <button
                    onClick={() => handleSetMain(index)}
                    className="bg-white text-gray-800 p-2 rounded hover:bg-gray-100"
                    title="Definir como principal"
                  >
                    <ImageIcon size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  title="Remover"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
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
