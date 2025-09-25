import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import CopyIcon from './components/icons/CopyIcon';
import CheckIcon from './components/icons/CheckIcon';
import SparklesIcon from './components/icons/SparklesIcon';
import { generatePromptFromImages, generateImageFromPrompt } from './services/geminiService';
import type { UploadedImage } from './types';

function App() {
  const [targetImage, setTargetImage] = useState<UploadedImage | null>(null);
  const [inputImages, setInputImages] = useState<UploadedImage[]>([]);
  const [additionalRequirements, setAdditionalRequirements] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageGenError, setImageGenError] = useState<string>('');

  const handleImageUpload = useCallback((file: File, type: 'target' | 'input') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      const uploadedImage: UploadedImage = {
        file,
        base64: base64String,
        mimeType: file.type,
      };
      if (type === 'target') {
        setTargetImage(uploadedImage);
      } else {
        setInputImages(prev => [...prev, uploadedImage]);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveInputImage = (indexToRemove: number) => {
    setInputImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleGenerateClick = async () => {
    if (!targetImage) {
      setError('Please upload a target image.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedPrompt('');
    setCopied(false);
    setGeneratedImage(null);
    setImageGenError('');

    try {
      const prompt = await generatePromptFromImages(targetImage, inputImages, additionalRequirements);
      setGeneratedPrompt(prompt);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTestPrompt = async () => {
    if (!generatedPrompt) return;

    setIsGeneratingImage(true);
    setGeneratedImage(null);
    setImageGenError('');

    try {
        const imageBase64 = await generateImageFromPrompt(generatedPrompt, inputImages);
        setGeneratedImage(imageBase64);
    } catch (e) {
        if (e instanceof Error) {
            setImageGenError(e.message);
        } else {
            setImageGenError('An unexpected error occurred while generating the image.');
        }
    } finally {
        setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
            Nano Banana Prompt Generator
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            AI-powered prompt generation for image editing and creation.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ImageUploader
            id="target-image"
            label="目标图 (Target Image)"
            onImageUpload={(file) => handleImageUpload(file, 'target')}
            onRemove={() => setTargetImage(null)}
            image={targetImage}
          />
          <div>
            <h2 className="font-semibold text-lg text-gray-300 mb-2">
              输入图 (Input Images - Optional)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {inputImages.map((image, index) => (
                <div key={index} className="relative group w-full aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  <img src={`data:${image.mimeType};base64,${image.base64}`} alt={`Input preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveInputImage(index)}
                    className="absolute top-1 right-1 p-1.5 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-opacity opacity-0 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
              <ImageUploader
                id="input-image"
                label=""
                onImageUpload={(file) => handleImageUpload(file, 'input')}
                onRemove={() => {}}
                image={null}
              />
            </div>
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto mb-8">
          <label htmlFor="additional-requirements" className="font-semibold text-lg text-gray-300 mb-2 block">
            补充要求 (Additional Requirements - Optional)
          </label>
          <textarea
            id="additional-requirements"
            value={additionalRequirements}
            onChange={(e) => setAdditionalRequirements(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            rows={3}
            placeholder="e.g., make it a cartoon style, use a dark color palette..."
          />
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleGenerateClick}
            disabled={!targetImage || isLoading}
            className="px-8 py-3 bg-cyan-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50"
          >
            {isLoading ? 'Generating...' : '生成提示词 (Generate Prompt)'}
          </button>
        </div>

        <div className="w-full max-w-3xl mx-auto min-h-[150px]">
          {isLoading && <Spinner />}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {generatedPrompt && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-inner relative">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">Generated Prompt:</h3>
              <p className="text-gray-200 whitespace-pre-wrap font-mono text-base leading-relaxed">
                {generatedPrompt}
              </p>
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={handleTestPrompt}
                  className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Test prompt"
                  title="Test Prompt"
                  disabled={isGeneratingImage}
                >
                  <SparklesIcon className="w-5 h-5 text-gray-300" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  aria-label="Copy prompt"
                  title="Copy Prompt"
                >
                  {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-gray-300" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {(isGeneratingImage || generatedImage || imageGenError) && (
            <div className="w-full max-w-md mx-auto mt-8">
                <h3 className="text-xl font-semibold text-cyan-400 mb-4 text-center">Test Result</h3>
                <div className="relative w-full aspect-square bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {isGeneratingImage && <Spinner />}
                    {imageGenError && (
                        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center w-full m-4">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{imageGenError}</span>
                        </div>
                    )}
                    {generatedImage && (
                        <img
                            src={`data:image/png;base64,${generatedImage}`}
                            alt="Generated from prompt"
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;