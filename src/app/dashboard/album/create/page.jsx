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

const CHUNK_SIZE = 5 * 1024 * 1024;

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

  const compressImage = async (file, quality = 0.5) => {
    const image = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const objectURL = URL.createObjectURL(file);
    image.src = objectURL;

    return new Promise((resolve) => {
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
    });
  };

  const handleFileUpload = async (files, categoryIndex) => {
    const updatedCategories = [...categories];
    const category = updatedCategories[categoryIndex];
    setCompressLoader(true);
    const compressedFiles = await Promise.all(
      Array.from(files).map((file) => compressImage(file))
    );
    setCompressLoader(false);

    category.files = [...category.files, ...compressedFiles];
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
      setCategories((prevCategories) => [
        { name: newCategoryName, files: [], uploaded: false, inputCount: 0 },
        ...prevCategories,
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
          toast({
            title: `Failed to upload part ${partNumber}`,
          });
        }

        const eTag = response.headers.get("ETag")?.replace(/"/g, "");

        if (!eTag) {
          toast({
            title: `No ETag received for part ${partNumber}`,
          });
        }

        parts.push({
          PartNumber: partNumber,
          ETag: eTag,
        });
      }

      const uploadId = new URLSearchParams(
        new URL(presignedUrls[0].presignedUrl).search
      ).get("uploadId");

      if (!uploadId) {
        throw new Error("No uploadId found in presigned URL");
      }

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

  const handleUploadToS3 = async (values) => {
    setIsUploading(true);
    setProgress(0);

    try {
      const payload = {
        name: title,
        contactPerson: [values.contactPerson1, values.contactPerson2],
        action: "E_ALBUM",
        song: "song.mp3",
        emailIds: [values.emailIds],
        images: [],
        profileAttached: values.profileAttached,
        isSingleSlided: values.isSingleSlided,
      };

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

      for (const categoryData of presignedData.data) {
        const category = categories.find(
          (cat) => cat.name === categoryData.category
        );
        const images = [];

        for (const fileData of categoryData.files) {
          const file = category.files.find((f) => f.name === fileData.fileName);

          await uploadFileChunks(fileData, file);

          images.push({
            key: fileData.key,
            mimeType: file.type,
          });

          uploadedFiles++;
          setProgress(Math.round((uploadedFiles / totalFiles) * 100));
        }

        payload.images.push({
          category: categoryData.category,
          images,
        });
      }
      setIsDialogOpen(false);
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
      console.log(createData.data);
      setAlbum(createData.data);
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
      form.reset({
        studioName: "",
        contactPerson1: "",
        contactPerson2: "",
        emailIds: "",
        attachProfile: false,
        singleSided: false,
      });
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
                    <div className="w-full ">
                      {categories.map((category, categoryIndex) => (
                        <div
                          key={categoryIndex}
                          className="border rounded-lg p-4 space-y-4 mb-3 bg-[#FBF9FC]"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-gray-900">
                              {category.name}
                            </h4>
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
                              className="border-dashed"
                              onChange={(e) =>
                                handleFileUpload(e.target.files, categoryIndex)
                              }
                              disabled={isUploading || category.uploaded}
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {category.files.map((file, fileIndex) => (
                                <div
                                  key={fileIndex}
                                  className="relative aspect-square"
                                >
                                  <img
                                    loading="lazy"
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${file.name}`}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  <Button
                                    type="button"
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
