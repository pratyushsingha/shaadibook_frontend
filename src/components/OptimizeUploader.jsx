import React, { useEffect, useState, useCallback } from "react";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import ThumbnailGenerator from "@uppy/thumbnail-generator";
import { Dashboard } from "@uppy/react";

// Optimization constants
const BATCH_SIZE = 10; // Reduced batch size
const THUMBNAIL_LIMIT = 50; // Only show thumbnails for first 50 images
const PREVIEW_SIZE = {
  width: 150,
  height: 150
};

const createUppyInstance = (categoryName, albumPin) => {
  const uppy = new Uppy({
    id: categoryName,
    autoProceed: false,
    allowMultipleUploadBatches: true,
    debug: false, // Disable debug mode for better performance
    restrictions: {
      maxFileSize: null,
      maxNumberOfFiles: null,
      allowedFileTypes: ["image/*"],
    },
    meta: {
      albumPin,
      category: categoryName,
    }
  })
    .use(ThumbnailGenerator, {
      thumbnailWidth: PREVIEW_SIZE.width,
      thumbnailHeight: PREVIEW_SIZE.height,
      waitForThumbnailsBeforeUpload: false,
      lazy: true,
    })
    .use(XHRUpload, {
      endpoint: `${process.env.NEXT_PUBLIC_STORAGE_URL}/file/upload`,
      fieldName: "files",
      formData: true,
      limit: BATCH_SIZE,
      timeout: 60000,
      retryDelays: [0, 1000, 3000, 5000],
    });

  // Memory optimization for file addition
  uppy.on('file-added', (file) => {
    const fileIndex = parseInt(file.id);
    
    // Only generate thumbnails for the first N files
    if (fileIndex < THUMBNAIL_LIMIT) {
      uppy.getPlugin('ThumbnailGenerator').requestThumbnail(file);
    } else {
      // For other files, use a placeholder or lightweight preview
      file.preview = '/placeholder-image.jpg';
    }

    // Clean up the original file data after adding to Uppy
    if (file.data && file.data instanceof Blob) {
      URL.revokeObjectURL(file.data);
    }
  });

  // Memory cleanup after successful upload
  uppy.on('upload-success', (file, response) => {
    if (file.preview && file.preview !== '/placeholder-image.jpg') {
      URL.revokeObjectURL(file.preview);
    }
    uppy.removeFile(file.id);
  });

  return uppy;
};

const OptimizedUploader = ({ category, onProgress, onComplete }) => {
  const [uppy, setUppy] = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process uploads in smaller batches
  const processUploadQueue = useCallback(async () => {
    if (uploadQueue.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const batch = uploadQueue.slice(0, BATCH_SIZE);
    setUploadQueue(prev => prev.slice(BATCH_SIZE));

    try {
      await Promise.all(batch.map(fileId => 
        uppy.upload([fileId])
          .then(() => {
            // Clear memory after each file upload
            const file = uppy.getFile(fileId);
            if (file && file.preview) {
              URL.revokeObjectURL(file.preview);
            }
          })
      ));

      if (uploadQueue.length > 0) {
        // Use setTimeout to prevent call stack overflow
        setTimeout(() => {
          setIsProcessing(false);
          processUploadQueue();
        }, 100);
      } else {
        setIsProcessing(false);
        onComplete?.();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsProcessing(false);
    }
  }, [uploadQueue, isProcessing, uppy, onComplete]);

  useEffect(() => {
    const uppyInstance = createUppyInstance(category.name, category.albumPin);
    
    // Handle file queue
    uppyInstance.on('files-added', (files) => {
      const fileIds = files.map(file => file.id);
      setUploadQueue(prev => [...prev, ...fileIds]);
    });

    // Update progress
    uppyInstance.on('upload-progress', (file, progress) => {
      const { bytesUploaded, bytesTotal } = progress;
      const percentage = (bytesUploaded / bytesTotal) * 100;
      onProgress?.(percentage);
    });

    setUppy(uppyInstance);

    return () => {
      uppyInstance.destroy();
    };
  }, [category.name, category.albumPin, onProgress]);

  // Start processing when queue updates
  useEffect(() => {
    if (uploadQueue.length > 0 && !isProcessing) {
      processUploadQueue();
    }
  }, [uploadQueue, isProcessing, processUploadQueue]);

  if (!uppy) return null;

  return (
    <div>
      <Dashboard
        uppy={uppy}
        plugins={['ThumbnailGenerator']}
        width="100%"
        height={400}
        showProgressDetails={true}
        note={`Processing ${uploadQueue.length} files remaining`}
        proudlyDisplayPoweredByUppy={false}
        showRemoveButtonAfterComplete={false}
        disabled={isProcessing}
        thumbnailWidth={PREVIEW_SIZE.width}
        thumbnailHeight={PREVIEW_SIZE.height}
      />
    </div>
  );
};

export default OptimizedUploader;