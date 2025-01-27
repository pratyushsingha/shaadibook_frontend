// public/image-worker.js
importScripts("https://cdn.jsdelivr.net/npm/browser-image-compression/dist/browser-image-compression.umd.js");

self.onmessage = async (event) => {
  const { files, options } = event.data;
  const compressedFiles = [];

  for (const file of files) {
    try {
      const compressedFile = await imageCompression(file, options);
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error("Compression failed:", error);
      compressedFiles.push(file); // Fallback to original file
    }
  }

  self.postMessage(compressedFiles);
};