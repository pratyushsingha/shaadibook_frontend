"use client";
import React, { useEffect, useState, useRef } from "react";
import { Search, Loader2, Mail, Plus, X, Download } from "lucide-react";
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
import useAuth from "@/store/useAuth";
import { useRouter } from "next/navigation";

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
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
};

export default function CreateAlbumPage() {
  const { toast, dismiss } = useToast();
  const { user } = useAuth();
  const [album, setAlbum] = useState({ name: "", code: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([]);
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
      studioName: user?.studioName || "",
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

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "downloaded-image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = () => {
    const categoryName = prompt("Please enter a category name:");
    if (categoryName) {
      setCategories((prevCategories) => [
        {
          name: categoryName.trim(),
          files: [],
          uploaded: false,
          uploadedUrls: [],
        },
        ...prevCategories,
      ]);
    } else {
      alert("Category name cannot be empty. Please try again.");
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

      setCategories((prevCategories) => {
        const updatedCategories = [...prevCategories];
        const categoryIndex = updatedCategories.findIndex(
          (cat) => cat.name === category
        );

        const updatedFiles = [...updatedCategories[categoryIndex].files];
        data.fileLinks.forEach((urlObj, idx) => {
          if (updatedFiles[startIndex + idx]) {
            updatedFiles[startIndex + idx].tempUrl = urlObj.tempUrl; // Temporary URL for preview
            updatedFiles[startIndex + idx].compressedUrl = urlObj.compressedUrl; // Compressed URL for album creation
          }
        });

        updatedCategories[categoryIndex].files = updatedFiles;
        updatedCategories[categoryIndex].uploadedUrls.push(
          ...data.fileLinks.map((urlObj) => urlObj.compressedUrl)
        );
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
                ...batchResponse.fileLinks.map((urlObj, index) => ({
                  url: urlObj.compressedUrl, 
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
          key: urlData.url,
          url: urlData.url,
          mimeType:
            urlData.name.split(".").pop().toLowerCase() === "webp"
              ? "image/webp"
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
      updatedCategories[categoryIndex].files = files;
      return updatedCategories;
    });
  };

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
                            <Input
                              disabled
                              placeholder="Enter Studio Name"
                              {...field}
                            />
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

                                {category.files.map((file, fileIndex) => {
                                  const fileId = `${category.name}-${file.name}-${fileIndex}`;
                                  const progress = uploadProgress[fileId] || 0;

                                  return (
                                    <div
                                      key={fileId}
                                      className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                                    >
                                      <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-200 flex-shrink-0 rounded overflow-hidden">
                                          {file.tempUrl || file.preview ? (
                                            <Image
                                              width={48}
                                              height={48}
                                              src={file.tempUrl || file.preview} // Use tempUrl for preview
                                              alt={file.name}
                                              className="object-cover w-full h-full"
                                            />
                                          ) : (
                                            <div className="w-full h-full animate-pulse bg-gray-300"></div>
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-800 truncate">
                                            {file.name}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {Math.round(file.size / 1024)} KB
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                          {progress < 100 ? (
                                            <span className="text-sm text-blue-500">
                                              Uploading... ({progress}%)
                                            </span>
                                          ) : (
                                            <span className="text-sm text-green-500">
                                              Uploaded
                                            </span>
                                          )}
                                          <Progress
                                            value={progress}
                                            max={100}
                                            className="w-32 h-2 bg-gray-200 rounded"
                                          />
                                        </div>
                                        {file.compressedUrl && (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={
                                              () =>
                                                handleDownload(
                                                  file.compressedUrl,
                                                  file.name
                                                ) 
                                            }
                                            className="ml-2"
                                          >
                                            <Download className="w-4 h-4 mr-1" />
                                            Download
                                          </Button>
                                        )}
                                      </div>
                                    </div>
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
        <Dialog
          className="w-10/12"
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <DialogContent>
            <AlbumDetailsCard album={album} />
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
