"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunk size

export default function AlbumForm() {
  const [categories, setCategories] = useState([
    { name: "Engagement", files: [], uploaded: false },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (files, categoryIndex) => {
    const updatedCategories = [...categories];
    const category = updatedCategories[categoryIndex];
    category.files = [...category.files, ...Array.from(files)];
    setCategories(updatedCategories);
  };

  const handleRemoveFile = (categoryIndex, fileIndex) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].files.splice(fileIndex, 1);
    setCategories(updatedCategories);
  };

  const handleAddCategory = () => {
    const newCategoryName = prompt("Enter category name:");
    if (newCategoryName) {
      setCategories([
        ...categories,
        { name: newCategoryName, files: [], uploaded: false },
      ]);
    }
  };

  const splitFileIntoChunks = (file) => {
    const chunks = [];
    let start = 0;
    console.log(file);
    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }

    return chunks;
  };

  const uploadFileChunks = async (fileData, file) => {
    try {
      console.log(file);
      const chunks = splitFileIntoChunks(file);
      const { key, presignedUrls } = fileData;
      console.log(fileData);
      const parts = [];

      // Upload each chunk and collect ETags
      for (let i = 0; i < presignedUrls.length; i++) {
        const { presignedUrl, partNumber } = presignedUrls[i];
        const chunk = chunks[i];

        const response = await fetch(presignedUrl, {
          method: "PUT",
          body: chunk,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to upload part ${partNumber}`);
        }

        // Get ETag from response headers (remove quotes if present)
        const eTag = response.headers.get("ETag")?.replace(/"/g, "");

        if (!eTag) {
          throw new Error(`No ETag received for part ${partNumber}`);
        }

        parts.push({
          PartNumber: partNumber,
          ETag: eTag,
        });
      }

      // Extract uploadId from the first presigned URL
      const uploadId = new URLSearchParams(
        new URL(presignedUrls[0].presignedUrl).search
      ).get("uploadId");

      if (!uploadId) {
        throw new Error("No uploadId found in presigned URL");
      }

      // Complete the multipart upload
      const completeResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/album/complete-multipart-upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            fileKey: key,
            uploadId,
            parts: parts,
          }),
        }
      );

      if (!completeResponse.ok) {
        throw new Error("Failed to complete multipart upload");
      }

      return await completeResponse.json();
    } catch (error) {
      // If something goes wrong, try to abort the upload
      console.log(error);
      if (fileData.fileKey) {
        const uploadId = new URLSearchParams(
          new URL(fileData.presignedUrls[0].presignedUrl).search
        ).get("uploadId");

        if (uploadId) {
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/album/abort-multipart-upload`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  fileKey: fileData.fileKey,
                  uploadId,
                }),
              }
            );
          } catch (abortError) {
            console.error("Error aborting upload:", abortError);
          }
        }
      }
      throw error;
    }
  };

  const handleUploadToS3 = async () => {
    setIsUploading(true);
    setProgress(0);
  
    try {
      const payload = {
        name: "Album + Sexy", // Replace with your dynamic album name
        contactPerson: ["Pratyush Singha", "Angshu Roy"], // Replace with dynamic contact person list
        action: "E_ALBUM",
        song: "song.mp3", // Handle song upload separately if required
        emailIds: ["john@example.com"], // Replace with dynamic email IDs
        images: [],
        profileAttached: false, // Adjust this value based on your logic
        isSingleSlided: true, // Adjust this value based on your logic
      };
  
      // Get presigned URLs for all files
      const presignedResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/album/get-presigned-urls`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            categories: categories.map((category) => ({
              name: category.name,
              files: category.files.map((file) => ({
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size,
              })),
            })),
          }),
        }
      );
  
      if (!presignedResponse.ok) {
        throw new Error("Failed to get presigned URLs");
      }
  
      const presignedData = await presignedResponse.json();
  
      let uploadedFiles = 0;
      const totalFiles = categories.reduce(
        (acc, category) => acc + category.files.length,
        0
      );
  
      // Upload files to S3 and collect their keys
      for (const categoryData of presignedData.data) {
        const category = categories.find(
          (cat) => cat.name === categoryData.category
        );
        const images = [];
  
        for (const fileData of categoryData.files) {
          const file = category.files.find((f) => f.name === fileData.fileName);
  
          // Upload file chunks to S3
          await uploadFileChunks(fileData, file);
  
          // Collect image key and MIME type
          images.push({
            key: fileData.key,
            mimeType: file.type,
          });
  
          uploadedFiles++;
          setProgress(Math.round((uploadedFiles / totalFiles) * 100));
        }
  
        // Add category with its images to the payload
        payload.images.push({
          category: categoryData.category,
          images,
        });
      }
  
      // Create album after all files are uploaded
      const createResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/album/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (!createResponse.ok) {
        throw new Error("Failed to create album");
      }
  
      const createData = await createResponse.json();
      console.log("Album created successfully:", createData);
  
      // Update UI or show success message
    } catch (error) {
      console.error("Error uploading files or creating album:", error);
      // Add user-friendly error handling here
    } finally {
      setIsUploading(false);
    }
  };
  

  // Rest of the component remains the same
  return (
    <Card className="w-full max-w-6xl mx-auto bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between bg-purple-600 text-white p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-white hover:text-white/90">
            Back
          </Button>
          <CardTitle className="text-lg font-medium">Akash + Anjali</CardTitle>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            Copy And Share
          </Button>
          <Button variant="secondary" size="sm">
            Save Album
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">
            Add More Details About Album
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Studio Name</label>
              <Input placeholder="Enter Studio Name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Studio Contact Person
              </label>
              <Input placeholder="Enter Customer Name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Email IDs (separate by comma)
              </label>
              <Input placeholder="Enter Email IDs" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Song (Will play while viewing album)
              </label>
              <Input type="file" accept="audio/*" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upload Album Images</h3>
            <Button variant="outline" size="sm" onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-1" /> Add New Category
            </Button>
          </div>
          {categories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                {category.uploaded && (
                  <span className="text-green-600 text-sm font-medium">
                    Uploaded
                  </span>
                )}
              </div>
              <div className="grid gap-4">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  className="border-dashed"
                  onChange={(e) =>
                    handleFileUpload(e.target.files, categoryIndex)
                  }
                  disabled={isUploading || category.uploaded}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {category.files.map((file, fileIndex) => (
                    <div key={fileIndex} className="relative aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${file.name}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600"
                        onClick={() =>
                          handleRemoveFile(categoryIndex, fileIndex)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isUploading && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-full bg-purple-200 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-purple-600">
                {progress}%
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleUploadToS3}
            disabled={isUploading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isUploading ? "Uploading..." : "Upload to S3"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
