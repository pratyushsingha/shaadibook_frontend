"use client";

import { Search, Plus, Trash2, Loader2, Mail } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import AlbumDetailsCard from "@/components/AlbumDetailsCard";
import { nanoid } from "nanoid";
import imageCompression from "browser-image-compression";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export default function CreateAlbumPage() {
  const { toast } = useToast();
  const [album, setAlbum] = useState({ name: "", code: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([
    { name: "Engagement", files: [], uploaded: false },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressLoader, setCompressLoader] = useState(false);

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

  // const compressImage = async (file, maxSize = 500 * 1024) => {
  //   try {
  //     const options = {
  //       maxSizeMB: maxSize / (1024 * 1024), // Convert max size to MB
  //       maxWidthOrHeight: 1000, // Set a max dimension to prevent excessive resizing
  //       useWebWorker: true, // Use web workers for offloading tasks
  //     };

  //     const compressedFile = await imageCompression(file, options);

  //     if (compressedFile.size > maxSize) {
  //       console.warn(
  //         `Image could not be compressed to the target size. Final size: ${
  //           compressedFile.size / 1024
  //         } KB`
  //       );
  //     }

  //     return compressedFile;
  //   } catch (error) {
  //     console.error("Error compressing image:", error);
  //     return file; // Return original file if compression fails
  //   }
  // };

  // const compressImage = async (file, maxSize = 500 * 1024) => {
  //   const compress = (file, quality, width, height) =>
  //     new Promise((resolve) => {
  //       const image = new Image();
  //       const canvas = document.createElement("canvas");
  //       const ctx = canvas.getContext("2d");
  //       const objectURL = URL.createObjectURL(file);

  //       image.src = objectURL;

  //       image.onload = () => {
  //         canvas.width = width;
  //         canvas.height = height;
  //         ctx.drawImage(image, 0, 0, width, height);

  //         canvas.toBlob(
  //           (blob) => {
  //             const compressedFile = new File([blob], file.name, {
  //               type: "image/jpeg",
  //               lastModified: Date.now(),
  //             });
  //             resolve(compressedFile);
  //           },
  //           "image/jpeg",
  //           quality
  //         );
  //       };
  //     });

  //   const image = new Image();
  //   const objectURL = URL.createObjectURL(file);

  //   const originalDimensions = await new Promise((resolve) => {
  //     image.onload = () => {
  //       resolve({ width: image.width, height: image.height });
  //     };
  //     image.src = objectURL;
  //   });

  //   let { width, height } = originalDimensions;
  //   let quality = 0.9;
  //   let compressedFile = await compress(file, quality, width, height);

  //   while (compressedFile.size > maxSize && quality > 0.1) {
  //     if (compressedFile.size > maxSize && width > 300 && height > 300) {
  //       width = Math.floor(width * 0.9);
  //       height = Math.floor(height * 0.9);
  //     }
  //     quality -= 0.1;
  //     compressedFile = await compress(file, quality, width, height);
  //   }

  //   if (compressedFile.size > maxSize) {
  //     console.warn(
  //       `Could not compress ${file.name} below ${
  //         maxSize / 1024
  //       } KB. Final size: ${compressedFile.size / 1024} KB`
  //     );
  //   }

  //   return compressedFile;
  // };

  const handleFileUpload = async (files, categoryIndex) => {
    const updatedCategories = [...categories];

    // If the category exists, update it
    if (categoryIndex !== null && updatedCategories[categoryIndex]) {
      const category = updatedCategories[categoryIndex];

      // Optional: Compress files before adding (uncomment if needed)
      // setCompressLoader(true);
      // const compressedFiles = await Promise.all(
      //   Array.from(files).map((file) => compressImage(file))
      // );
      // setCompressLoader(false);

      // Add the new files to the existing category
      category.files = [...category.files, ...files];
    } else {
      // If no category exists for the given index, create a new category
      const newCategory = {
        name: `Category ${updatedCategories.length + 1}`,
        files: [...files],
        uploaded: false,
      };

      updatedCategories.push(newCategory); // Add the new category at the end
    }

    setCategories(updatedCategories); // Update the categories state
  };

  const handleRemoveFile = (categoryIndex, fileIndex) => {
    const updatedCategories = [...categories];
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

  const uploadFiles = async (files, albumPin) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    formData.append("albumPin", albumPin);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STORAGE_URL}/file/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload files");
    }

    return await response.json();
  };

  const generateCode = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    return `${timestamp}`;
  };

  const handleUpload = async (values) => {
    setIsUploading(true);
    setProgress(0);

    try {
      const albumPin = generateCode(); 

      const allFiles = categories.flatMap((category) => category.files);
      const totalFiles = allFiles.length;

      const uploadResult = await uploadFiles(allFiles, albumPin);

      setProgress(50);

      let fileIndex = 0;
      const categoryImages = categories.map((category) => ({
        category: category.name,
        images: category.files.map(() => {
          const imageKey = uploadResult.data[fileIndex++];
          return {
            key: imageKey,
            mimeType: "image/jpeg", 
          };
        }),
      }));

      const albumPayload = {
        name: title,
        contactPerson: [values.contactPerson1, values.contactPerson2],
        action: "E_ALBUM",
        song: "song.mp3",
        emailIds: [values.emailIds],
        images: categoryImages,
        profileAttached: values.attachProfile,
        isSingleSlided: values.singleSided,
        code: albumPin,
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
      setProgress(100); 
      setIsDialogOpen(true);
      toast({
        title: "Album created successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to create album",
        message: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      form.reset();
    }
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

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Upload Album Images</h3>
                      <div className="flex space-x-3">
                        {compressLoader && <Loader2 className="animate-spin" />}
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
                    <Accordion type="single" collapsible className="w-full ">
                      {categories.map((category, categoryIndex) => (
                        <AccordionItem value={`${categoryIndex}`}>
                          <div
                            key={categoryIndex}
                            className="border rounded-lg p-4 space-y-4 mb-3 bg-[#FBF9FC]"
                          >
                            <div className="flex justify-between items-center">
                              <AccordionTrigger>
                                <h4 className="font-medium text-gray-900">
                                  {category.name}
                                </h4>
                              </AccordionTrigger>
                              {category.uploaded && (
                                <span className="text-green-600 text-sm font-medium">
                                  Uploaded
                                </span>
                              )}
                            </div>

                            <div className="grid gap-4">
                              {/* <Input
                              type="file"
                              multiple
                              className="border-dashed"
                              onChange={(e) =>
                                handleFileUpload(e.target.files, categoryIndex)
                              }
                              disabled={isUploading || category.uploaded}
                            /> */}
                              <FileUpload
                                onChange={(files) =>
                                  handleFileUpload(files, categoryIndex)
                                }
                                accept="image/*"
                                multiple
                                disabled={isUploading}
                              />
                            </div>
                          </div>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    {isUploading && (
                      <div className="w-full mt-4">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {Math.round(progress)}%
                        </p>
                      </div>
                    )}
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
