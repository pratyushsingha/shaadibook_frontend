"use client";
import React, { useEffect, useState, Suspense } from "react";
import {
  CalendarDays,
  Mail,
  Users,
  Music2,
  Copy,
  Ticket,
  Check,
  Download,
} from "lucide-react";
import useAlbum from "../../../../store/useAlbum";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/loader/Loader";
import Image from "next/image";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import axios from "axios";

const AlbumDetails = () => {
  const searchParams = useSearchParams();
  const albumId = searchParams.get("albumId");
  const { getAlbumDetailsById, album, loading, error } = useAlbum();
  const [isCopied, setIsCopied] = useState(false);
  const [albumStatus, setAlbumStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [categoryImages, setCategoryImages] = useState({});

  useEffect(() => {
    if (albumId) {
      getAlbumDetailsById(albumId);
    }
  }, [albumId]);

  const fetchCategoryImages = async (categoryId) => {
    try {
      console.log(categoryId);
      const response = await api.get(`album/details`, {
        categoryId: "cm6bufbiq0003sy27jmiavwis",
      });
      console.log(response);
      setCategoryImages((prev) => ({
        ...prev,
        [categoryId]: response.data.data.albumCategoryImages,
      }));
    } catch (error) {
      console.error("Failed to fetch category images:", error);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(album.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = async (file) => {
    try {
      const response = await axios.get(file.url, {
        responseType: "blob",
      });
      const filename = file.key.split("/").pop() || `image_${file.id}.jpg`;
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (loading || statusLoading) return <Loader />;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-11/12 p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{album.name}</h1>
            <div className="flex items-center mt-2 text-gray-600">
              <div className="flex items-center bg-purple-50 rounded-full px-4 py-1">
                <span className="text-purple-700 font-medium">
                  Album Code: {album.code}
                </span>
                <button
                  onClick={copyCode}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-purple-600">
              <Users className="h-5 w-5" />
              <h3 className="font-medium">Contact Persons</h3>
            </div>
            <ArrayDisplay items={album.contactPerson} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-purple-600">
              <Mail className="h-5 w-5" />
              <h3 className="font-medium">Email IDs</h3>
            </div>
            <ArrayDisplay items={album.senderEmailIDs} />
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
            <CalendarDays className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Created On</p>
              <p className="font-medium">
                {new Date(album.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
            <Music2 className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Background Music</p>
              <p className="font-medium">
                {album.songs ? "Available" : "Not Added"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {albumStatus && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Album Processing Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Processed Images</p>
                <p className="font-medium">{albumStatus.processedFiles}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
              <Ticket className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-500">Remaining Images</p>
                <p className="font-medium">{albumStatus.remainingFiles}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
              <Copy className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Failed Images</p>
                <p className="font-medium">{albumStatus.failedFiles}</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-500">Overall Status</p>
            <p
              className={`font-medium ${
                albumStatus.overallStatus === "success"
                  ? "text-green-600"
                  : albumStatus.overallStatus === "partial_success"
                  ? "text-yellow-600"
                  : albumStatus.overallStatus === "in_progress"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {albumStatus.overallStatus === "success"
                ? "Successfully Processed"
                : albumStatus.overallStatus === "partial_success"
                ? "Partially Processed"
                : albumStatus.overallStatus === "in_progress"
                ? "In Progress"
                : "Failed"}
            </p>
          </div>
        </div>
      )}

      <Accordion type="multiple" className="w-full">
        {album?.AlbumCategory?.map((category) => (
          <AccordionItem
            key={category.id}
            value={category.id}
            onFocus={() => fetchCategoryImages(category.id)}
          >
            <AccordionTrigger className="text-xl font-semibold">
              {category.name}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryImages[category.id]?.map((file) => (
                  <div key={file.id} className="relative aspect-square group">
                    <Image
                      src={file.key}
                      alt={`Image ${file.id}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const ArrayDisplay = React.memo(({ items, className = "" }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {items?.map((item, index) => (
      <span
        key={index}
        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
      >
        {item}
      </span>
    ))}
  </div>
));

const AlbumDetailsWrapper = () => (
  <Suspense fallback={<Loader />}>
    <AlbumDetails />
  </Suspense>
);

export default AlbumDetailsWrapper;
