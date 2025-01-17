import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const PortfolioImageUpload = ({ onImagesUpload, onProgressUpdate, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const { toast } = useToast();

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setLoading(true);
    const newImages = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      url: null,
      isProcessed: false,
    }));

    setImages((prevImages) => [...prevImages, ...newImages]);

    // Prepare FormData for each file
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    try {
      // First upload images to get URLs
      await axios.post(`${process.env.NEXT_PUBLIC_STORAGE_URL}/file/portfolio`, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          // Update progress for each image
          const updatedImages = [...images];
          updatedImages.forEach((image, index) => {
            image.progress = percent;
            images[index] = image;
          });

          setImages(updatedImages);
          onProgressUpdate(percent); // Send progress to parent
        },
      });

      const uploadedImageUrls = await Promise.all(
        files.map((file) => fetchImageUrlFromBackend(file))
      );

      // Update image URLs after successful upload
      setImages((prevImages) =>
        prevImages.map((image, index) => ({
          ...image,
          url: uploadedImageUrls[index],
        }))
      );

      setLoading(false);
      onComplete(uploadedImageUrls);

      // Start checking for processing status
      checkProcessingStatus(uploadedImageUrls);
      toast({ title: "Images uploaded successfully!" });
    } catch (error) {
      setLoading(false);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  };

  const fetchImageUrlFromBackend = async (file) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_STORAGE_URL}/file/portfolio-images`, file);
      return response.data.url;
    } catch (error) {
      console.error("Failed to fetch image URL:", error);
      throw new Error("Failed to fetch image URL");
    }
  };

  const checkProcessingStatus = (uploadedImageUrls) => {
    // Use polling or websocket to check processing status
    const interval = setInterval(async () => {
      const processingComplete = await Promise.all(
        uploadedImageUrls.map(async (url) => {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_STORAGE_URL}/image-status?url=${url}`);
          return response.data.isProcessed;
        })
      );

      if (processingComplete.every((status) => status)) {
        clearInterval(interval);
        // Mark images as processed
        setImages((prevImages) =>
          prevImages.map((image) => ({
            ...image,
            isProcessed: true,
          }))
        );
      }
    }, 5000); // Check every 5 seconds
  };

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Upload Portfolio Images</FormLabel>
        <FormControl>
          <Input
            type="file"
            accept="image/*"
            multiple
            className="cursor-pointer"
            onChange={handleImageUpload}
            disabled={loading}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${images.reduce((acc, img) => acc + img.progress, 0) / images.length}%` }}
          ></div>
        </div>
      )}
      <div className="space-y-4">
        {images.map((image, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-20 h-20 rounded overflow-hidden">
              <img
                src={image.previewUrl}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${image.progress}%` }}
              ></div>
            </div>
            {image.isProcessed && (
              <div className="text-green-600 text-sm mt-2">Processed!</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioImageUpload;
