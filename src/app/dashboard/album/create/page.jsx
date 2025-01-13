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
import { Progress } from "@/components/ui/progress";

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
  const compressionToastId = useRef(null);

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
          resolve(result);
        },
        error(err) {
          reject(err);
        },
      });
    });
  };

  const handleFileUpload = async (files, categoryIndex) => {
    setCompressLoader(true);
    const toastId = showCompressionToast();

    try {
      const updatedCategories = [...categories];
      const category = updatedCategories[categoryIndex];

      const compressedFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          if (!(file instanceof File || file instanceof Blob)) {
            throw new Error("Invalid file input for compression.");
          }
          const compressedFile = await compressImage(file);
          return {
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
            name: file.name,
          };
        })
      );

      category.files = [...category.files, ...compressedFiles];
      setCategories(updatedCategories);
      dismiss(toastId);
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

    const totalFiles = getTotalFiles();
    let filesUploaded = 0;

    try {
      for (const category of categories) {
        for (
          let fileIndex = 0;
          fileIndex < category.files.length;
          fileIndex++
        ) {
          const fileObj = category.files[fileIndex];

          try {
            // Compress single image
            const compressedFile = await compressImage(
              fileObj.file,
              0.4,
              5000000
            );
            compressedFile.name = fileObj.name;

            // Upload single image
            const response = await uploadSingleImage(
              compressedFile,
              albumPin,
              category.name,
              fileObj.name,
              fileIndex
            );

            uploadResponses.push(response);

            filesUploaded++;
            const totalProgressPercent = (filesUploaded / totalFiles) * 100;
            setTotalProgress(totalProgressPercent);

            // const progress = ((fileIndex + 1) / category.files.length) * 100;
            // toast({
            //   title: `Uploading ${category.name}`,
            //   description: `${fileIndex + 1} of ${
            //     category.files.length
            //   } images uploaded (${Math.round(progress)}%)`,
            //   duration: Infinity,
            // });
            const categoryProgress =
              ((fileIndex + 1) / category.files.length) * 100;
            toast({
              title: `Uploading ${category.name}`,
              description: `${fileIndex + 1} of ${
                category.files.length
              } images uploaded (${Math.round(categoryProgress)}%)`,
              duration: 2000,
            });
          } catch (error) {
            console.error(`Error uploading ${fileObj.name}:`, error);
            toast({
              title: `Failed to upload ${fileObj.name}`,
              description: error.message,
              variant: "destructive",
            });
          }
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
      toast({ title: "Album created successfully" });
    } catch (error) {
      console.error("Album creation error:", error);
      toast({
        title: "Failed to create album",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
                  <div className={`${isUploading ? "block" : "hidden"}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Total Progress ({Math.round(totalProgress)}%)
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getTotalFiles()} images total
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
                                                  <img
                                                    loading="lazy"
                                                    className="w-full h-40 object-cover rounded"
                                                    src={file.preview}
                                                    alt={file.name}
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
