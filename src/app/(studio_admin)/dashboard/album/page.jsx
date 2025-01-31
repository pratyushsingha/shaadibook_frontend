"use client";
import React, { Suspense, useEffect, useState } from "react";
import useAlbum from "../../../../store/useAlbum";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/loader/Loader";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Download from "yet-another-react-lightbox/plugins/download";
import { ParallaxScroll } from "../../../../components/ui/pallallax-scroll";
import { CalendarDays, Mail, Users, Music2, Copy, Check } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AlbumDetails = () => {
  const searchParams = useSearchParams();
  const albumId = searchParams.get("albumId");
  const { getAlbumDetailsById, album, loading, error } = useAlbum();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    getAlbumDetailsById(albumId);
  }, [albumId]);

  useEffect(() => {
    if (album?.AlbumCategory) {
      const allImages = album.AlbumCategory.flatMap((category) =>
        category.files.map((file) => ({
          src: file.originalImageUrl,
          thumbnail: file.desktopImageUrl,
          download: file.downloadImageUrl,
          fileId: file.id,
        }))
      );
      setSlides(allImages);
    }
  }, [album]);

  const copyCode = () => {
    navigator.clipboard.writeText(album.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) return <Loader />;
  if (error)
    return <div className="flex justify-center items-center">{error}</div>;

  const handleImageClick = (fileId) => {
    const index = slides.findIndex((slide) => slide.fileId === fileId);
    if (index !== -1) {
      setCurrentIndex(index);
      setLightboxOpen(true);
    }
  };

  return (
    <div className="w-8/12 mx-auto  p-6 space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>
            <BreadcrumbLink href={`/dashboard/album?albumId=${album.id}`}>
              {album.name}
            </BreadcrumbLink>
          </BreadcrumbPage>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>
      <div className="bg-white rounded-lg p-6">
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
        <h2 className="text-2xl space-y-5 font-semibold my-10">
          Album Category
        </h2>
        <Accordion type="multiple" className="w-full space-y-3">
          {album?.AlbumCategory?.map((category) => (
            <div key={category.id} className="bg-[#FBF9FC] rounded-lg p-6">
              <AccordionItem
                key={category.id}
                value={category.id}
                onFocus={() => fetchCategoryImages(category.id)}
              >
                <AccordionTrigger className="text-xl font-semibold">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {category.name}
                  </h2>
                </AccordionTrigger>
                <AccordionContent>
                  <ParallaxScroll
                    images={category.files}
                    handleImageClick={handleImageClick}
                  />
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </div>

      {slides.length > 0 && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={slides}
          index={currentIndex}
          plugins={[Zoom, Fullscreen, Slideshow, Download]}
        />
      )}
    </div>
  );
};

const Page = () => (
  <Suspense fallback={<Loader />}>
    <AlbumDetails />
  </Suspense>
);

export default Page;

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
