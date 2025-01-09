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
        categories: categories.map((category) => ({
          name: category.name,
          files: category.files.map((file) => ({
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
          })),
        })),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/album/get-presigned-urls`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get presigned URLs");
      }

      const data = await response.json();

      let uploadedFiles = 0;
      const totalFiles = categories.reduce(
        (acc, category) => acc + category.files.length,
        0
      );

      for (const categoryData of data.data) {
        const category = categories.find(
          (cat) => cat.name === categoryData.category
        );
        console.log(category);
        for (const fileData of categoryData.files) {
          const file = category.files.find((f) => f.name == fileData.fileName);
          console.log(fileData);
          await uploadFileChunks(fileData, file);

          uploadedFiles++;
          setProgress(Math.round((uploadedFiles / totalFiles) * 100));
        }
      }

      setCategories(
        categories.map((category) => ({
          ...category,
          uploaded: true,
        }))
      );
    } catch (error) {
      console.error("Error uploading files:", error);
      // Add user-friendly error handling here
    } finally {
      setIsUploading(false);
    }
  };

  // Rest of the component remains the same
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-purple-700 text-white">
        <CardTitle>Album Form</CardTitle>
        <CardDescription className="text-white">
          Create and manage your album categories and upload images.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <section className="mt-6">
          <h3 className="font-semibold">Upload Album Images</h3>
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">{category.name}</h4>
                {category.uploaded && (
                  <span className="text-green-500 font-medium">Uploaded</span>
                )}
              </div>
              <Input
                type="file"
                multiple
                onChange={(e) =>
                  handleFileUpload(e.target.files, categoryIndex)
                }
                disabled={isUploading || category.uploaded}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {category.files.map((file, fileIndex) => (
                  <div
                    key={fileIndex}
                    className="relative border p-2 rounded-md"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${file.name}`}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <Button
                      className="absolute top-0 right-0 p-0 rounded-full bg-red-500"
                      size="sm"
                      onClick={() => handleRemoveFile(categoryIndex, fileIndex)}
                    >
                      <Trash2 size={16} className="text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button
            onClick={handleAddCategory}
            className="mt-4"
            disabled={isUploading}
          >
            <Plus className="mr-2" size={16} />
            Add New Category
          </Button>
        </section>

        {isUploading && (
          <div className="mt-4">
            <p>Uploading... {progress}%</p>
          </div>
        )}

        <section className="mt-6 flex justify-between items-center">
          <Button onClick={handleUploadToS3} disabled={isUploading}>
            Upload to S3
          </Button>
        </section>
      </CardContent>
    </Card>
  );
}
