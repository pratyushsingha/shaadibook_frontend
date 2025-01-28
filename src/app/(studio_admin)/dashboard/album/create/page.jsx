"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Trash2, Loader2, Mail, Download } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AlbumDetailsCard from "@/components/AlbumDetailsCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

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

const FileUploadCard = ({
  file,
  fileId,
  progress,
  onDownload,
  uploadStartTime,
  bytesUploaded,
}) => {
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const lastUpdateTime = useRef(Date.now());
  const lastBytesUploaded = useRef(0);

  useEffect(() => {
    if (progress > 0 && progress < 100 && uploadStartTime) {
      const now = Date.now();
      const timeDiff = now - lastUpdateTime.current;

      if (timeDiff > 1000) {
        const bytesDiff = bytesUploaded - lastBytesUploaded.current;
        const currentSpeed = (bytesDiff / timeDiff) * 1000;

        setUploadSpeed(currentSpeed);

        const remainingBytes = file.size - bytesUploaded;
        const timeRemainingSeconds =
          currentSpeed > 0 ? remainingBytes / currentSpeed : 0;
        setTimeRemaining(timeRemainingSeconds);

        lastUpdateTime.current = now;
        lastBytesUploaded.current = bytesUploaded;
      }
    }
  }, [progress, bytesUploaded, file.size, uploadStartTime]);

  const formatTime = (seconds) => {
    if (!seconds || seconds === Infinity) return "Calculating...";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes.toFixed(1)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatSpeed = (bytesPerSecond) => {
    if (bytesPerSecond === 0) return "Calculating...";
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(1)} B/s`;
    if (bytesPerSecond < 1024 * 1024)
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 flex-shrink-0 rounded overflow-hidden">
          {/* {file.preview ? (
            <Image
              width={48}
              height={48}
              src={file.preview}
              alt={file.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full animate-pulse bg-gray-300" />
          )} */}
            <div className="w-full h-full animate-pulse bg-gray-300" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex flex-col space-y-1 min-w-[250px]">
          {progress < 100 ? (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-blue-500">
                  Uploading... ({progress}%)
                </span>
                <span className="text-gray-500">
                  {formatBytes(bytesUploaded)} / {formatBytes(file.size)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatSpeed(uploadSpeed)}</span>
                <span>ETA: {formatTime(timeRemaining)}</span>
              </div>
              <Progress
                value={progress}
                max={100}
                className="h-2 bg-gray-200 rounded"
              />
            </>
          ) : (
            <span className="text-sm text-green-500">
              Uploaded Successfully
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onDownload(file)}
          className="ml-2"
        >
          <Download className="w-4 h-4 mr-1" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default function CreateAlbumPage() {
  const { toast } = useToast();
  const [album, setAlbum] = useState({ name: "", code: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileProgress, setFileProgress] = useState({});
  const [totalFilesProcessed, setTotalFilesProcessed] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadTimes, setUploadTimes] = useState({});
  const [uploadedBytes, setUploadedBytes] = useState({});

  const uploadFileWithProgress = async (file, presignedUrl) => {
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setFileProgress((prev) => ({
            ...prev,
            [file.name]: Math.round(percentComplete),
          }));
          setUploadedBytes((prev) => ({
            ...prev,
            [file.name]: event.loaded,
          }));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("PUT", presignedUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  useEffect(() => {
    const total = categories.reduce(
      (acc, category) => acc + category.files.length,
      0
    );
    setTotalFiles(total);
  }, [categories]);

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

  const handleFileUpload = async (files, categoryIndex) => {
    const updatedCategories = [...categories];
    const category = updatedCategories[categoryIndex];

    // Create object URLs for previews
    const filesWithPreviews = Array.from(files).map((file) => {
      if (file.type.startsWith("image/")) {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
      }
      return file;
    });

    category.files = [...category.files, ...filesWithPreviews];
    setCategories(updatedCategories);
  };

  const handleRemoveFile = (categoryIndex, fileIndex) => {
    const updatedCategories = [...categories];
    const file = updatedCategories[categoryIndex].files[fileIndex];

    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }

    updatedCategories[categoryIndex].files.splice(fileIndex, 1);
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

  const handleDownload = (file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadToS3 = async (values) => {
    setIsUploading(true);
    setProgress(0);
    setFileProgress({});
    setUploadTimes({});
    setUploadedBytes({});

    try {
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
      const { presignedUrls, pin } = presignedData.data;

      let uploadedFiles = 0;
      const payload = {
        name: title,
        contactPerson: [values.contactPerson1, values.contactPerson2],
        action: "E_ALBUM",
        song: "song.mp3",
        emailIds: [values.emailIds],
        images: [],
        profileAttached: values.attachProfile,
        isSingleSlided: values.singleSided,
        code: pin,
      };

      for (const categoryData of presignedUrls) {
        const category = categories.find(
          (cat) => cat.name === categoryData.category
        );
        const images = [];

        for (const fileData of categoryData.files) {
          const file = category.files.find((f) => f.name === fileData.fileName);

          setUploadTimes((prev) => ({
            ...prev,
            [file.name]: Date.now(),
          }));

          try {
            await uploadFileWithProgress(file, fileData.presignedUrl);

            images.push({
              key: fileData.key,
              mimeType: file.type,
            });

            uploadedFiles++;
            setProgress(Math.round((uploadedFiles / totalFiles) * 100));
            setTotalFilesProcessed(uploadedFiles);
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            throw error;
          }
        }

        payload.images.push({
          category: categoryData.category,
          images,
        });
      }

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
      setAlbum({
        name: createData.data.name,
        code: createData.data.code,
      });
      toast({
        title: "Album created successfully",
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to create album",
        message: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      categories.forEach((category) => {
        category.files.forEach((file) => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
      });
    };
  }, []);

  return (
    <>
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-3">
            <Button
              className="bg-gradient-to-r from-[#7B2991] to-[#4F2D82] text-white py-3 px-4 rounded-lg text-lg hover:from-purple-end hover:to-purple-start transition duration-300"
              asChild
            >
              <Link href="/dashboard">Back</Link>
            </Button>
            <p className="self-center">{title}</p>
          </div>
          <div className="flex gap-2">
            <Button>Copy And Share</Button>
            <Button
              onClick={form.handleSubmit(handleUploadToS3)}
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
                onSubmit={form.handleSubmit(handleUploadToS3)}
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
                      <Input
                        type="file"
                        className="cursor-pointer"
                        accept="audio/*"
                      />
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

                  <div className={`${isUploading ? "block" : "hidden"}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Uploading - {Math.round(progress)}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {totalFilesProcessed} / {totalFiles} images
                      </span>
                    </div>
                    <Progress
                      value={progress}
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
                                <Input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="border-dashed"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      e.target.files,
                                      categoryIndex
                                    )
                                  }
                                  disabled={isUploading || category.uploaded}
                                />

                                {category.files.map((file, fileIndex) => {
                                  const fileId = `${category.name}-${file.name}-${fileIndex}`;
                                  const progress = fileProgress[file.name] || 0;
                                  return (
                                    <FileUploadCard
                                      key={fileId}
                                      file={file}
                                      fileId={fileId}
                                      progress={progress}
                                      onDownload={handleDownload}
                                      uploadStartTime={uploadTimes[file.name]}
                                      bytesUploaded={
                                        uploadedBytes[file.name] || 0
                                      }
                                    />
                                  );
                                })}
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
          <DialogContent className="sm:max-w-md">
            <AlbumDetailsCard album={album} />
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
