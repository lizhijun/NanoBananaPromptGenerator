
import React, { useRef } from 'react';
import type { UploadedImage } from '../types';
import ImageIcon from './icons/ImageIcon';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageUpload: (file: File) => void;
  onRemove: () => void;
  image: UploadedImage | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageUpload, onRemove, image }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-cyan-400');
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-cyan-400');
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-cyan-400');
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="font-semibold text-lg text-gray-300">
        {label}
      </label>
      <div className="relative w-full aspect-square bg-gray-800 rounded-lg overflow-hidden group">
        {image ? (
          <>
            <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Uploaded preview" className="w-full h-full object-cover" />
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-opacity opacity-0 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        ) : (
          <label
            htmlFor={id}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex flex-col justify-center items-center w-full h-full border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
              <ImageIcon className="w-10 h-10 mb-3" />
              <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs">PNG, JPG, GIF, WEBP</p>
            </div>
            <input ref={inputRef} id={id} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
