"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

const generateRandomNumber = () => {
  return Math.floor(Math.random() * 10);
};

export default function CreateAlbumPage() {
  const [album, setAlbum] = useState({ name: "", code: "" });
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [totalProgress, setTotalProgress] = useState(0);
  const [totalFilesProcessed, setTotalFilesProcessed] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [albumPin, setAlbumPin] = useState(null);

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

  useEffect(() => {
    const total = categories.reduce(
      (acc, category) => acc + category.files.length,
      0
    );
    setTotalFiles(total);
  }, [categories]);

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
    if (
      !values.studioName ||
      !values.contactPerson1 ||
      !values.contactPerson2 ||
      !values.emailIds
    ) {
      console.error("Missing required fields");
      return;
    }

    if (!categories.some((category) => category.files.length > 0)) {
      console.error("No files selected");
      return;
    }

    setIsUploading(true);
    setTotalProgress(0);
    setTotalFilesProcessed(0);

    const generatedPin = generateRandomNumber();
    setAlbumPin(generatedPin);
    console.log("Generated album pin:", generatedPin);

    try {
      const uploadedUrls = [];

      for (const category of categories) {
        if (!category.files.length) continue;

        const totalBatches = Math.ceil(category.files.length / BATCH_SIZE);
        const categoryUrls = [];

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const startIndex = batchIndex * BATCH_SIZE;
          const endIndex = Math.min(
            (batchIndex + 1) * BATCH_SIZE,
            category.files.length
          );
          const batch = category.files.slice(startIndex, endIndex);

          try {
            const batchResponse = await uploadImageBatch(
              batch,
              generatedPin,
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
            throw error;
          }
        }

        uploadedUrls.push({
          category: category.name,
          urls: categoryUrls,
        });
      }

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
        code: generatedPin,
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
    } catch (error) {
      console.error("Album creation error:", error);
    } finally {
      setIsUploading(false);
      setAlbumPin(null);
      categories.forEach((category) => {
        category.files.forEach((fileObj) => {
          if (fileObj.preview) {
            URL.revokeObjectURL(fileObj.preview);
          }
        });
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
                                                    <div className="w-full h-40 bg-gray-200 animate-pulse rounded"></div>
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

                                <div className="mt-6 space-y-4">
                                  <h3 className="text-lg font-semibold">
                                    Uploaded Images
                                  </h3>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {category.uploadedUrls.map((url, index) => (
                                      <div
                                        key={index}
                                        className="relative group"
                                      >
                                        <img
                                          src={url}
                                          alt={`Uploaded image ${index + 1}`}
                                          className="w-full h-40 object-cover rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                          <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white text-sm bg-black/50 px-3 py-1 rounded-full hover:bg-black/70 transition-colors"
                                          >
                                            View Full
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
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
          <AlbumDetailsCard album={album} />
        </Dialog>
      </main>
    </>
  );
}
