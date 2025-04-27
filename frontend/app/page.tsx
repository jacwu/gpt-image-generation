"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";

// Define an interface for image data
interface ImageData {
  file: File;
  previewUrl: string;
}

export default function Home() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<string>("1024x1024");
  const [imageQuality, setImageQuality] = useState<string>("medium");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  const MAX_IMAGES = 4;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const newImages = [...images];
        newImages[index] = {
          file,
          previewUrl: fileReader.result as string
        };
        setImages(newImages);
      };
      fileReader.readAsDataURL(file);
      setGeneratedImageUrl(null); // Reset generated image when new file is selected
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const newImages = [...images];
        newImages[index] = {
          file,
          previewUrl: fileReader.result as string
        };
        setImages(newImages);
      };
      fileReader.readAsDataURL(file);
      setGeneratedImageUrl(null); // Reset generated image when new file is selected
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("size", imageSize);
      formData.append("quality", imageQuality);

      // Choose the appropriate endpoint based on whether images are uploaded
      const endpoint = images.length > 0
        ? "http://localhost:5000/edit-image"
        : "http://localhost:5000/generate-image";

      // If images are uploaded, append them to the form data
      if (images.length > 0) {
        images.forEach((image) => {
          formData.append(`image`, image.file);
        });
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImageUrl(imageUrl);
    } catch (err) {
      setError(`Failed to generate image: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Image Generation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload up to 4 images, enter a prompt to generate an image
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Area */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Upload Images
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Render existing image slots */}
                {Array.from({ length: Math.min(images.length + 1, MAX_IMAGES) }).map((_, index) => (
                  <div key={index} className="relative">
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer h-48"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[index] = el;
                          return undefined;
                        }}
                        onChange={(e) => handleFileChange(e, index)}
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                      />

                      {!images[index] ? (
                        <div className="text-center">
                          <svg
                            className="mx-auto h-8 w-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            {index === 0 ? "Upload your first image" : "Add another image"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            PNG, JPG, JPEG
                          </p>
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={images[index].previewUrl}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Remove button for uploaded images */}
                    {images[index] && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                        aria-label="Remove image"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Image count indicator */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {images.length} of {MAX_IMAGES} images selected
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prompt
              </label>
              <input
                type="text"
                id="prompt"
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Enter your prompt here..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Image Size Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["1024x1024", "1536x1024", "1024x1536", "auto"].map((size) => (
                  <div key={size} className="flex items-center">
                    <input
                      id={`size-${size}`}
                      name="image-size"
                      type="radio"
                      checked={imageSize === size}
                      onChange={() => setImageSize(size)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor={`size-${size}`}
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      {size}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Quality Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Quality
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["low", "medium", "high", "auto"].map((quality) => (
                  <div key={quality} className="flex items-center">
                    <input
                      id={`quality-${quality}`}
                      name="image-quality"
                      type="radio"
                      checked={imageQuality === quality}
                      onChange={() => setImageQuality(quality)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor={`quality-${quality}`}
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      {quality}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : images.length > 0 ? 'Generate Image' : 'Generate Image'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Results Section */}
        {generatedImageUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Generated Image
            </h2>
            <div className="relative w-full h-64 sm:h-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedImageUrl}
                alt="Generated"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-4">
              <a
                href={generatedImageUrl}
                download="generated-image.png"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Download Image
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
