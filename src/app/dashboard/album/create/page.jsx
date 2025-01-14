"use client";
import React, { useEffect, useState, useRef } from "react";
import { Search, Loader2, Mail, Plus, X } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import AlbumDetailsCard from "@/components/AlbumDetailsCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

const BATCH_SIZE = 2;

const formSchema = z.object({
  studioName: z
    .string()
    .min(2, { message: "Studio name must be at least 2 characters." }),
  contactPerson1: z
    .string()
    .min(2, { message: "Contact person name must be at least 2 characters." }),
  contactPerson2: z
    .string()
    .min(2, { message: "Contact person name must be at least 2 characters." }),
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
const generateCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const BatchUploadUI = ({
  category,
  files,
  uploadProgress,
  onRemoveImage,
  isUploading,
}) => {
  const getBatches = () => {
    const batches = [];
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      batches.push(files.slice(i, i + BATCH_SIZE));
    }
    return batches;
  };

  const getProgressForFile = (file, batchIndex, fileIndex) => {
    const fileId = `${category.name}-${file.name}-${
      batchIndex * BATCH_SIZE + fileIndex
    }`;
    return uploadProgress[fileId] || 0;
  };

  return (
    <div className="space-y-6">
      {getBatches().map((batch, batchIndex) => (
        <Card key={batchIndex} className="p-4">
          <div className="mb-4 flex justify-between items-center">
            <h4 className="font-medium text-sm">
              Batch {batchIndex + 1} ({batch.length} images)
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {Math.round(
                  batch.reduce(
                    (acc, file, i) =>
                      acc + getProgressForFile(file, batchIndex, i),
                    0
                  ) / batch.length
                )}
                %
              </span>
              <Progress
                value={
                  batch.reduce(
                    (acc, file, i) =>
                      acc + getProgressForFile(file, batchIndex, i),
                    0
                  ) / batch.length
                }
                className="w-24 h-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {batch.map((file, fileIndex) => {
              const progress = getProgressForFile(file, batchIndex, fileIndex);
              const absoluteIndex = batchIndex * BATCH_SIZE + fileIndex;

              return (
                <div key={`${file.name}-${fileIndex}`} className="relative">
                  <div className="aspect-square relative rounded-lg overflow-hidden border bg-gray-50">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="object-cover w-full h-full"
                    />

                    {isUploading && progress < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-sm font-medium">
                          {progress}%
                        </div>
                      </div>
                    )}

                    {!isUploading && (
                      <button
                        onClick={() => onRemoveImage(absoluteIndex)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-1">
                    <p
                      className="text-xs text-gray-600 truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <Progress value={progress} className="h-1 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default function CreateAlbumPage() {
  const { toast, dismiss } = useToast();
  const [album, setAlbum] = useState({ name: "", code: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([
    { name: "Engagement", files: [], uploaded: false, uploadedUrls: [] },
  ]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [totalProgress, setTotalProgress] = useState(0);
  const [totalFilesProcessed, setTotalFilesProcessed] = useState(0);

  const [totalFiles, setTotalFiles] = useState(0);

  useEffect(() => {
    const total = categories.reduce(
      (acc, category) => acc + category.files.length,
      0
    );
    setTotalFiles(total);
  }, [categories]);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTitle(params.get("title") || "");
  }, []);

  const handleAddCategory = () => {
    if (newCategoryName.trim() !== "") {
      setCategories([
        ...categories,
        { name: newCategoryName.trim(), files: [], uploaded: false, uploadedUrls: [] },
      ]);
      setNewCategoryName("");
    } else {
      alert("Please provide a valid category name.");
    }
  };

  const uploadImageBatch = async (
    images,
    albumPin,
    category,
    startIndex,
    updateProgress
  ) => {
    const formData = new FormData();

    images.forEach((img) => {
      const actualFile = img.file || img;
      formData.append("files", actualFile);
    });

    formData.append("albumPin", albumPin);
    formData.append("category", category);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STORAGE_URL}/file/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();

      images.forEach((img, index) => {
        const fileId = `${category}-${img.name}-${startIndex + index}`;
        updateProgress(fileId, 100);
      });

      // Update the category with the new URLs
      setCategories((prevCategories) => {
        const updatedCategories = [...prevCategories];
        const categoryIndex = updatedCategories.findIndex(
          (cat) => cat.name === category
        );
        updatedCategories[categoryIndex].uploadedUrls.push(...data.fileLinks);
        return updatedCategories;
      });

      return data;
    } catch (error) {
      console.error("Upload batch error:", error);
      throw error;
    }
  };

  const handleUpload = async (values) => {
    console.log("Upload started", { values, categories });

    if (
      !values.studioName ||
      !values.contactPerson1 ||
      !values.contactPerson2 ||
      !values.emailIds
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!categories.some((category) => category.files.length > 0)) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setTotalProgress(0);
    setTotalFilesProcessed(0);
    const albumPin = generateCode();
    const uploadedUrls = [];
    console.log("Generated album pin:", albumPin);

    const uploadToastId = toast({
      title: "Starting Upload",
      description: "Preparing files...",
      duration: Infinity,
    });

    try {
      for (const category of categories) {
        if (!category.files.length) continue;
        console.log(
          `Processing category: ${category.name} with ${category.files.length} files`
        );

        const totalBatches = Math.ceil(category.files.length / BATCH_SIZE);
        const categoryUrls = [];

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const startIndex = batchIndex * BATCH_SIZE;
          const endIndex = Math.min(
            (batchIndex + 1) * BATCH_SIZE,
            category.files.length
          );
          const batch = category.files.slice(startIndex, endIndex);

          console.log(
            `Uploading batch ${batchIndex + 1} of ${totalBatches} for ${
              category.name
            }`
          );

          try {
            const batchResponse = await uploadImageBatch(
              batch,
              albumPin,
              category.name,
              startIndex,
              (fileId, progress) => {
                setUploadProgress((prev) => ({
                  ...prev,
                  [fileId]: progress,
                }));
              }
            );

            if (batchResponse && batchResponse.fileLinks) {
              categoryUrls.push(
                ...batchResponse.fileLinks.map((url, index) => ({
                  url,
                  name: batch[index].name,
                  category: category.name,
                }))
              );
            }

            setTotalFilesProcessed((prev) => {
              const newProcessed = prev + batch.length;
              const totalProgressPercent = (newProcessed / totalFiles) * 100;
              setTotalProgress(totalProgressPercent);
              return newProcessed;
            });
          } catch (error) {
            console.error(`Batch upload error:`, error);
            toast({
              title: `Failed to upload batch ${batchIndex + 1}`,
              description: error.message,
              variant: "destructive",
            });
            throw error;
          }
        }

        uploadedUrls.push({
          category: category.name,
          urls: categoryUrls,
        });
      }

      console.log("All files uploaded, creating album");
      const categoryImages = uploadedUrls.map((categoryData) => ({
        category: categoryData.category,
        images: categoryData.urls.map((urlData) => ({
          key: urlData.name,
          url: urlData.url,
          mimeType:
            urlData.name.split(".").pop().toLowerCase() === "png"
              ? "image/png"
              : "image/jpeg",
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

      console.log("Sending album creation payload:", albumPayload);

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
      console.log("Album created successfully:", createData);
      setAlbum(createData.data);
      setIsDialogOpen(true);

      dismiss(uploadToastId);
      toast({
        title: "Album created successfully",
        description: `All files uploaded successfully`,
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

  const handleFileUpload = (files, categoryIndex) => {
    setCategories((prevCategories) => {
      const updatedCategories = [...prevCategories];
      updatedCategories[categoryIndex].files = [
        ...updatedCategories[categoryIndex].files,
        ...files,
      ];
      return updatedCategories;
    });
  };

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
                  <div className={`${isUploading ? "block" : "hidden"}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Uploading - {Math.round(totalProgress)}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {totalFilesProcessed} / {totalFiles} images
                      </span>
                    </div>
                    <Progress
                      value={totalProgress}
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
                                    handleFileUpload(files, categoryIndex)
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
                                                  {file.preview ? (
                                                    <Image
                                                      width={128}
                                                      height={128}
                                                      src={file?.preview}
                                                      alt={file.name}
                                                      className="w-full h-40 object-cover rounded"
                                                    />
                                                  ) : (
                                                    "loading.."
                                                  )}

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

                                {category.uploadedUrls.length > 0 && (
                                  <div className="mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold">
                                      Uploaded URLs
                                    </h3>
                                    <ul className="list-disc pl-5">
                                      {category.uploadedUrls.map((url, index) => (
                                        <li key={index} className="text-sm text-blue-600">
                                          <a href={url} target="_blank" rel="noopener noreferrer">
                                            {url}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
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
