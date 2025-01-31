"use client";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";
import {  X } from "lucide-react";

export default function ZoomableImage({
  previewImage,
  dialogImage,
  downloadImage,
  imageKey,
  alt,
  className,
}) {
  const [open, setOpen] = useState(false);

  const handleDownload = async () => {
    if (!downloadImage || !imageKey) return;

    try {
      const response = await fetch(downloadImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = imageKey.split("/").pop() || "download.jpg";
      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  return (
    <>
      <div
        className="relative cursor-pointer overflow-hidden rounded-md shadow-lg hover:shadow-2xl transition-all duration-300"
        onClick={() => setOpen(true)}
      >
        <Image
        fill
          src={previewImage}
          alt={alt || ""}
          width={300}
          height={200}
          className={`object-cover w-full h-auto rounded-md ${className}`}
          placeholder="blur"
          blurDataURL={previewImage}
        />
      </div>

      <Lightbox
        open={open}
        plugins={[Fullscreen, Download]}
        close={() => setOpen(false)}
        slides={[{ src: dialogImage }]}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
          iconClose: () => (
            <X
              className="text-white absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            />
          ),
        }}
      />

      {/* Download Button */}
      {/* {downloadImage && (
        <div className="mt-2 text-center">
          <Button
            onClick={handleDownload}
            className="bg-blue-500 text-white flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Image
          </Button>
        </div>
      )} */}
    </>
  );
}
