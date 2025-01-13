"use client";

import { Search, Loader2, Mail, Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import Compressor from "compressorjs";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AlbumDetailsCard from "@/components/AlbumDetailsCard";
import { Checkbox } from "@/components/ui/checkbox";
import LazyLoad from "react-lazyload";
import { Progress } from "@/components/ui/progress";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  studioName: z.string().min(2, {
    message: "Studio name must be at least 2 characters.",
  }),
  contactPerson1: z.string().min(2, {
    message: "Contact person name must be at least 2 characters.",
  }),
  contactPerson2: z.string().min(2, {
    message: "Contact person name must be at least 2 characters.",
  }),
  emailIds: z.string().refine(
    (val) => {
      const emails = val.split(",").map((e) => e.trim());
      return emails.every(
        (email) => z.string().email().safeParse(email).success
      );
    },
    {
      message:
        "Invalid email format. Please enter valid email addresses separated by commas.",
    }
  ),
  attachProfile: z.boolean().default(false),
  singleSided: z.boolean().default(false),
});

const CHUNK_SIZE = 80; // Process 50 images at a time
const MEMORY_THRESHOLD = 500 * 1024 * 1024; // 500MB memory threshold
const MAX_CONCURRENT_COMPRESSIONS = 10;

const getMemoryUsage = () => {
  if (performance && performance.memory) {
    return performance.memory.usedJSHeapSize;
  }
  return 0;
};

const CompressionToast = () => (
  <div className="flex items-center space-x-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>
      Compressing images
      <span className="text-sm text-muted-foreground ml-1">Please wait...</span>
    </span>
  </div>
);

export default function CreateAlbumPage() {
  const { toast, dismiss } = useToast();

  const [album, setAlbum] = useState({ name: "", code: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([
    { name: "Engagement", files: [], uploaded: false },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [compressLoader, setCompressLoader] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [totalProgress, setTotalProgress] = useState(0);
  const compressionToastId = useRef(null);
  const [progressState, setProgressState] = useState({
    phase: "", // 'compression' or 'upload'
    current: 0,
    total: 0,
    percentComplete: 0,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTitle(params.get("title") || "");
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studioName: "",
      contactPerson1: "",
      contactPerson2: "",
      emailIds: "",
      attachProfile: false,
      singleSided: false,
    },
  });

  const showCompressionToast = () => {
    if (compressionToastId.current) {
      dismiss(compressionToastId.current);
    }

    const { id } = toast({
      title: "Processing Images",
      description: <CompressionToast />,
      duration: Infinity,
    });

    compressionToastId.current = id;
    return id;
  };

  const updateProgress = (phase, current, total) => {
    // Compression is 50% of total progress, uploading is the other 50%
    const baseProgress = phase === "compression" ? 0 : 50;
    const percentComplete = baseProgress + (current / total) * 50;

    setProgressState({
      phase,
      current,
      total,
      percentComplete,
    });
  };

  const compressImage = async (file, quality = 0.2, convertSize = 5000000) => {
    if (!(file instanceof File || file instanceof Blob)) {
      return file;
    }

    if ("preview" in file) {
      return file.file;
    }

    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality,
        convertSize,
        success(result) {
          // Create a temporary URL for preview
          const preview = URL.createObjectURL(result);
          resolve({
            file: result,
            preview,
            name: file.name,
            size: result.size,
          });
        },
        error(err) {
          reject(err);
        },
      });
    });
  };
  const processImageBatch = async (
    files,
    updateProgress,
    batchIndex,
    totalBatches,
    updatePreview
  ) => {
    const compressPromises = [];
    let currentConcurrent = 0;
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Wait if we've hit the concurrent limit or memory threshold
      while (
        currentConcurrent >= MAX_CONCURRENT_COMPRESSIONS ||
        getMemoryUsage() > MEMORY_THRESHOLD
      ) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      currentConcurrent++;
      const compressionPromise = compressImage(file)
        .then((result) => {
          results.push(result);
          currentConcurrent--;

          updateProgress(
            ((batchIndex * CHUNK_SIZE + results.length) /
              (totalBatches * CHUNK_SIZE)) *
              100
          );

          updatePreview(result);

          return result;
        })
        .catch((error) => {
          currentConcurrent--;
          console.error(`Error compressing ${file.name}:`, error);
          return null;
        });

      compressPromises.push(compressionPromise);
    }

    return (await Promise.all(compressPromises)).filter(
      (result) => result !== null
    );
  };

  const handleFileUpload = async (
    files,
    categoryIndex,
    setCategories,
    showCompressionToast,
    dismiss,
    toast
  ) => {
    setCompressLoader(true);
    const toastId = showCompressionToast();
    const fileArray = Array.from(files);
    const totalBatches = Math.ceil(fileArray.length / CHUNK_SIZE);
    const totalFiles = fileArray.length;
    let processedFiles = 0;

    try {
      for (let i = 0; i < totalBatches; i++) {
        const batch = fileArray.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

        const updatePreview = (compressedFile) => {
          processedFiles++;
          updateProgress("compression", processedFiles, totalFiles);
          setCategories((prevCategories) => {
            const updatedCategories = [...prevCategories];
            const category = updatedCategories[categoryIndex];
            category.files = [...category.files, compressedFile];
            return updatedCategories;
          });
        };

        await processImageBatch(
          batch,
          (progress) => {
            toast({
              title: "Processing Images",
              description: `Processing batch ${
                i + 1
              }/${totalBatches} (${Math.round(progress)}%)`,
              duration: Infinity,
            });
          },
          i,
          totalBatches,
          updatePreview
        );

        if (window.gc) {
          window.gc();
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      dismiss(toastId);
      toast({
        title: "Image Processing Complete",
        description: `Successfully processed ${fileArray.length} images`,
        duration: 3000,
      });
    } catch (error) {
      dismiss(toastId);
      toast({
        title: "Error processing images",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCompressLoader(false);
      compressionToastId.current = null;
    }
  };

  const uploadSingleImage = async (
    file,
    albumPin,
    category,
    fileName,
    fileIndex
  ) => {
    const fileId = `${category}-${fileName}-${fileIndex}`;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("albumPin", albumPin);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: progress,
          }));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: 100,
          }));
          resolve(JSON.parse(xhr.response));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));

      xhr.open("POST", `${process.env.NEXT_PUBLIC_STORAGE_URL}/file/upload`);
      xhr.send(formData);
    });
  };

  // const uploadSingleImage = async (
  //   file,
  //   albumPin,
  //   category,
  //   fileName,
  //   fileIndex
  // ) => {
  //   const actualFile = file.file || file;
  //   const fileId = `${category}-${fileName}-${fileIndex}`;

  //   // Add file size check
  //   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB example limit
  //   if (actualFile.size > MAX_FILE_SIZE) {
  //     throw new Error(
  //       `File ${fileName} is too large. Maximum size is ${
  //         MAX_FILE_SIZE / (1024 * 1024)
  //       }MB`
  //     );
  //   }

  //   const formData = new FormData();
  //   formData.append("image", actualFile);
  //   formData.append("albumPin", albumPin);

  //   return new Promise((resolve, reject) => {
  //     const xhr = new XMLHttpRequest();

  //     // Add timeout handling
  //     xhr.timeout = 30000; // 30 seconds timeout
  //     xhr.ontimeout = () => {
  //       reject(new Error(`Upload timed out for ${fileName}`));
  //     };

  //     xhr.upload.addEventListener("progress", (event) => {
  //       if (event.lengthComputable) {
  //         const progress = Math.round((event.loaded * 100) / event.total);
  //         setUploadProgress((prev) => ({
  //           ...prev,
  //           [fileId]: progress,
  //         }));
  //       }
  //     });

  //     xhr.onload = () => {
  //       if (xhr.status >= 200 && xhr.status < 300) {
  //         setUploadProgress((prev) => ({
  //           ...prev,
  //           [fileId]: 100,
  //         }));
  //         resolve(JSON.parse(xhr.response));
  //       } else {
  //         reject(
  //           new Error(`Upload failed for ${fileName} with status ${xhr.status}`)
  //         );
  //       }
  //     };

  //     xhr.onerror = () => {
  //       reject(new Error(`Network error while uploading ${fileName}`));
  //     };

  //     xhr.open("POST", `${process.env.NEXT_PUBLIC_STORAGE_URL}/file/upload`);
  //     xhr.send(formData);
  //   });
  // };

  const getTotalFiles = () => {
    return categories.reduce(
      (total, category) => total + category.files.length,
      0
    );
  };

  const handleUpload = async (values) => {
    setIsUploading(true);
    setTotalProgress(0);
    const albumPin = generateCode();
    const uploadResponses = [];
    const UPLOAD_CHUNK_SIZE = 1;
    const uploadToastId = toast({
      title: "Starting Upload",
      description: "Preparing files...",
      duration: Infinity,
    });

    let totalFilesProcessed = 0;
    const totalFiles = getTotalFiles();

    try {
      for (const category of categories) {
        const totalChunks = Math.ceil(
          category.files.length / UPLOAD_CHUNK_SIZE
        );

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const startIndex = chunkIndex * UPLOAD_CHUNK_SIZE;
          const endIndex = Math.min(
            (chunkIndex + 1) * UPLOAD_CHUNK_SIZE,
            category.files.length
          );
          const chunk = category.files.slice(startIndex, endIndex);

          toast({
            id: uploadToastId,
            title: `Uploading ${category.name}`,
            description: `Processing chunk ${chunkIndex + 1} of ${totalChunks}`,
            duration: Infinity,
          });

          const chunkPromises = chunk.map(async (fileObj, index) => {
            try {
              const compressedFile = await compressImage(
                fileObj.file,
                0.4,
                5000000
              );
              compressedFile.name = fileObj.name;
              totalFilesProcessed++;
              updateProgress("upload", totalFilesProcessed, totalFiles);
              // Upload the compressed file
              return await uploadSingleImage(
                compressedFile,
                albumPin,
                category.name,
                fileObj.name,
                startIndex + index
              );
            } catch (error) {
              console.error(`Error processing ${fileObj.name}:`, error);
              toast({
                title: `Failed to process ${fileObj.name}`,
                description: error.message,
                variant: "destructive",
              });
              return null;
            }
          });

          const chunkResults = await Promise.all(chunkPromises);
          const validResults = chunkResults.filter((result) => result !== null);
          uploadResponses.push(...validResults);

          totalFilesProcessed += chunk.length;
          const totalProgressPercent = (totalFilesProcessed / totalFiles) * 100;
          setTotalProgress(totalProgressPercent);

          toast({
            id: uploadToastId,
            title: `Uploading Files`,
            description: `${totalFilesProcessed} of ${totalFiles} files processed (${Math.round(
              totalProgressPercent
            )}%)`,
            duration: Infinity,
          });

          if (window.gc) {
            window.gc();
          }

          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      const categoryImages = categories.map((category) => ({
        category: category.name,
        images: category.files.map((fileObj) => ({
          key: fileObj.name,
          mimeType: fileObj.file.type || "image/jpeg",
        })),
      }));

      const albumPayload = {
        name: title,
        contactPerson: [values.contactPerson1, values.contactPerson2],
        emailIds: values.emailIds.split(",").map((email) => email.trim()),
        images: categoryImages,
        profileAttached: values.attachProfile,
        isSingleSlided: values.singleSided,
        code: albumPin,
        action: "E_ALBUM",
      };

      const createResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/album/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(albumPayload),
        }
      );

      if (!createResponse.ok) {
        throw new Error("Failed to create album");
      }

      const createData = await createResponse.json();
      setAlbum(createData.data);
      setIsDialogOpen(true);

      dismiss(uploadToastId);
      toast({
        title: "Album created successfully",
        description: `Processed ${totalFilesProcessed} files`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Album creation error:", error);
      dismiss(uploadToastId);
      toast({
        title: "Failed to create album",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);

      categories.forEach((category) => {
        category.files.forEach((fileObj) => {
          if (fileObj.preview) {
            URL.revokeObjectURL(fileObj.preview);
          }
        });
      });
    }
  };

  const handleRemoveImage = (categoryIndex, fileIndex) => {
    const updatedCategories = [...categories];
    const category = updatedCategories[categoryIndex];

    URL.revokeObjectURL(category.files[fileIndex].preview);

    category.files.splice(fileIndex, 1);
    setCategories(updatedCategories);
  };

  const handleAddCategory = () => {
    const newCategoryName = prompt("Enter category name:");
    if (newCategoryName) {
      setCategories((prevCategories) => [
        { name: newCategoryName, files: [], uploaded: false },
        ...prevCategories,
      ]);
    }
  };

  const generateCode = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    return `${timestamp}`;
  };

  useEffect(() => {
    return () => {
      categories.forEach((category) => {
        category.files.forEach((fileObj) => {
          URL.revokeObjectURL(fileObj.preview);
        });
      });
    };
  }, []);
  return (
    <>
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button
            className="bg-gradient-to-r from-[#7B2991] to-[#4F2D82] text-white py-3 px-4 rounded-lg text-lg hover:from-purple-end hover:to-purple-start transition duration-300"
            asChild
          >
            <Link href="/dashboard">Back</Link>
          </Button>
          <div className="flex gap-2">
            <Button
              className="text-white py-3 px-4 rounded-lg hover:from-purple-end hover:to-purple-start transition duration-300"
              variant="outline"
            >
              Copy And Share
            </Button>
            <Button
              className="bg-gradient-to-r from-[#7B2991] to-[#4F2D82] text-white py-3 px-4 rounded-lg text-lg hover:from-purple-end hover:to-purple-start transition duration-300"
              onClick={form.handleSubmit(handleUpload)}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Album
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">
              Add More Details About Album
            </h2>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleUpload)}
                className="space-y-8"
              >
                <div className="grid gap-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          placeholder="Search by mo.no, Email id Stud"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <Input value={title} readOnly />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="studioName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Studio Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Studio Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPerson1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Studio Contact Person</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Customer Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPerson2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Studio Contact Person</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Customer Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Song(Will play while viewing album)</Label>
                      <Input type="file" className="cursor-pointer" />
                    </div>
                    <div className="flex items-end gap-4">
                      <FormField
                        control={form.control}
                        name="emailIds"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Email IDs (separate by comma)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Email IDs" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        className="flex-shrink-0 bg-gradient-to-r from-[#7B2991] to-[#4F2D82] text-white py-3 px-4 rounded-lg text-lg hover:from-purple-end hover:to-purple-start transition duration-300"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Mail
                      </Button>
                    </div>
                    <div className="flex items-start gap-8 self-center mt-5">
                      <FormField
                        control={form.control}
                        name="attachProfile"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Attach My Profile To eAlbum</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="singleSided"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Single Sided</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div
                    className={`${
                      isUploading || compressLoader ? "block" : "hidden"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        {progressState.phase === "compression"
                          ? "Compressing"
                          : "Uploading"}{" "}
                        - {Math.round(progressState.percentComplete)}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {progressState.current} / {progressState.total} images
                      </span>
                    </div>
                    <Progress
                      value={progressState.percentComplete}
                      max={100}
                      className="h-2 w-full bg-gray-200"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Upload Album Images</h3>
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddCategory}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add New Category
                        </Button>
                      </div>
                    </div>
                    {categories.map((category, categoryIndex) => (
                      <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                        key={categoryIndex}
                      >
                        <AccordionItem value={`${categoryIndex}`}>
                          <div className="border rounded-lg p-4 space-y-4 mb-3 bg-[#FBF9FC]">
                            <div className="flex justify-between items-center">
                              <AccordionTrigger>
                                <h4 className="font-semibold text-xl text-gray-900">
                                  {category.name}
                                </h4>
                              </AccordionTrigger>
                            </div>
                            <AccordionContent>
                              <div className="grid gap-4">
                                <FileUpload
                                  onChange={(files) =>
                                    handleFileUpload(
                                      files,
                                      categoryIndex,
                                      setCategories,
                                      showCompressionToast,
                                      dismiss,
                                      toast
                                    )
                                  }
                                  accept="image/*"
                                  multiple
                                  disabled={isUploading}
                                />

                                {category.files.length > 0 && (
                                  <div className="mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold">
                                      Uploaded Files
                                    </h3>
                                    <div className="flex flex-wrap gap-4">
                                      {category.files.map((file, fileIndex) => {
                                        const fileId = `${category.name}-${file.name}-${fileIndex}`;
                                        const progress =
                                          uploadProgress[fileId] || 0;
                                        return (
                                          <div
                                            key={fileId}
                                            className="w-1/4 p-2 mx-auto"
                                          >
                                            <div className="space-y-2">
                                              <div className="flex justify-between items-center">
                                                <div className="flex flex-col items-center w-full">
                                                  <LazyLoadImage
                                                    src={file.preview}
                                                    alt={file.name}
                                                    className="w-full h-40 object-cover rounded"
                                                    placeholder={
                                                      <div className="w-full h-40 rounded bg-gray-200 animate-pulse"></div>
                                                    }
                                                  />

                                                  <span className="text-sm text-gray-600">
                                                    {file.name}
                                                  </span>
                                                  <div className="w-full flex space-x-2">
                                                    <span className="text-sm text-gray-600">
                                                      {progress}%
                                                    </span>
                                                    <Progress
                                                      value={progress}
                                                      max={100}
                                                      className="h-2 self-center"
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </div>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Album Created Successfully</DialogTitle>
            </DialogHeader>
            <AlbumDetailsCard album={album} />
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
