"use client";
import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Mail,
  Users,
  Music2,
  Copy,
  Ticket,
  Check,
} from "lucide-react";
import useAlbum from "../../../../store/useAlbum";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/loader/Loader";
import Image from "next/image";

const page = () => {
  const searchParams = useSearchParams();
  const albumId = searchParams.get("albumId");
  const { getAlbumDetailsById, album, loading, error } = useAlbum();
  const [isCopied, setIsCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Album details copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    getAlbumDetailsById(albumId);
  }, []);

  const ArrayDisplay = ({ items, className = "" }) => (
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
  );
  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;
  return (
    <div className="max-w-full mx-auto p-6 space-y-8">
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

      {album?.AlbumCategory?.map((category) => (
        <div key={category.id} className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            {category.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.files.map((file) => (
              <div key={file.id} className="group relative">
                <Image
                  width={200}
                  height={200}
                  src={file.key}
                  alt="Album"
                  className="w-full h-48 object-cover rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <a
                    href={file.key}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white bg-black/50 px-4 py-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    View Full
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Album Settings
        </h2>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                album.profileAttached ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-gray-700">
              Profile {album.profileAttached ? "Attached" : "Not Attached"}
            </span>
          </div>
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                album.isSingleSlided ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-gray-700">
              {album.isSingleSlided ? "Single Sided" : "Double Sided"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
