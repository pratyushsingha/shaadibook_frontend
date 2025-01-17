import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PortfolioImageUpload from "./PortfolioImageUpload";

const PortfolioForm = () => {
  const [images, setImages] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const handleProgressUpdate = (progress) => {
    const totalProgress = images.reduce(
      (acc, image) => acc + image.progress,
      0
    );
    const averageProgress = Math.round(totalProgress / images.length);
    setOverallProgress(averageProgress);
  };

  const handleImagesUpload = (uploadedImageUrls) => {
    setImages((prev) => [
      ...prev,
      ...uploadedImageUrls.map((url) => ({ url, progress: 100 })),
    ]);
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      toast({
        title: "No images uploaded",
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }
    // Submit the image URLs to the backend for processing
    toast({ title: "Portfolio images submitted successfully!" });
  };

  return (
    <div className="space-y-4">
      <h3>Upload Portfolio Images</h3>
      <PortfolioImageUpload
        onImagesUpload={handleImagesUpload}
        onProgressUpdate={handleProgressUpdate}
        onComplete={handleImagesUpload}
      />
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        ></div>
      </div>
      <div className="flex justify-end">
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleSubmit}
        >
          Save Portfolio
        </Button>
      </div>
    </div>
  );
};

export default PortfolioForm;
