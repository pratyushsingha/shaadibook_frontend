"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useAuth from "@/store/useAuth";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { useEffect, useState } from "react";
import PortfolioForm from "@/components/forms/PortfolioForm";
const profileFormSchema = z.object({
  studioName: z
    .string()
    .max(100, "Studio Name cannot exceed 100 characters")
    .optional(),
  name: z.string().max(100, "Name cannot exceed 100 characters").optional(),
  email: z.string().email("Invalid email").optional(),
  phoneNo: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .optional(),
  about: z.string().max(200, "About cannot exceed 200 characters").optional(),
  address: z
    .string()
    .max(200, "Address cannot exceed 200 characters")
    .optional(),
  city: z
    .string()
    .max(100, "City name cannot exceed 100 characters")
    .optional(),
  country: z
    .string()
    .max(100, "Country name cannot exceed 100 characters")
    .optional(),
  zipCode: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{4,10}$/.test(value), {
      message: "Invalid Zip Code",
    }),
  logo: z.string().url("Invalid Logo URL").optional(),
  coverImage: z.string().url("Invalid Cover Image URL").optional(),
});

const uploadImageToApi = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_STORAGE_URL}/file/logo-cover-image`,
      formData
    );
    return data.fileUrl;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Failed to upload image.");
  }
};

const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 1,
    useWebWorker: true,
  };
  return await imageCompression(file, { ...defaultOptions, ...options });
};

const ImageUploadField = ({
  id,
  label,
  loading,
  progress,
  onChange,
  previewUrl,
}) => (
  <FormItem>
    <FormLabel>{label}</FormLabel>
    <div className="space-y-2">
      <FormControl>
        <div className="relative">
          <Input
            id={id}
            type="file"
            accept="image/*"
            className={`cursor-pointer ${loading ? "opacity-50" : ""}`}
            onChange={onChange}
            disabled={loading}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded">
              <div className="loader"></div>
            </div>
          )}
        </div>
      </FormControl>
      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      {previewUrl && !loading && (
        <div className="relative w-20 h-20 rounded overflow-hidden">
          <img
            src={previewUrl}
            alt="Preview"
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  </FormItem>
);

function ProfilePage() {
  const { user, editProfile, error } = useAuth();
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState({
    coverImage: { loading: false, progress: 0, preview: null },
    logo: { loading: false, progress: 0, preview: null },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      studioName: user?.studioName || "",
      name: user?.name || "",
      email: user?.email || "",
      phoneNo: user?.phoneNo || "",
      about: user?.about || "",
      address: user?.address || "",
      city: user?.city || "",
      country: user?.country || "",
      zipCode: user?.zipCode || "",
      logo: user?.logo || "",
      coverImage: user?.coverImage || "",
    },
  });

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setUploadState((prev) => ({
      ...prev,
      [type]: { loading: true, progress: 0, preview: previewUrl },
    }));

    try {
      const compressedFile = await compressImage(file, {
        maxWidthOrHeight: type === "coverImage" ? 800 : 200,
        maxSizeMB: 1.5,
      });

      const uploadedUrl = await uploadImageToApi(compressedFile);
      form.setValue(type, uploadedUrl);

      setUploadState((prev) => ({
        ...prev,
        [type]: { loading: false, progress: 100, preview: uploadedUrl },
      }));

      toast({ title: `${type} uploaded successfully.` });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadState((prev) => ({
        ...prev,
        [type]: { ...prev[type], loading: false },
      }));
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await editProfile(data);
      if (response) {
        toast({ title: "Profile updated successfully." });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (error) {
    toast({
      title: error,
      variant: "destructive",
    });
  }
  return (
    <FormProvider {...form}>
      <main className="flex-1 overflow-auto p-6 bg-gray-100">
        <div className="space-y-6">
          <Card className="bg-[#FBF9FC]">
            <CardHeader>
              <h2 className="text-lg font-medium">Basic Profile</h2>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="studioName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Studio Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Id</FormLabel>
                          <FormControl>
                            <Input disabled {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact No</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="">
                    <FormField
                      control={form.control}
                      name="about"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            About Business/You (Up to 200 Characters)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter About Details"
                              className="resize-none"
                              rows={1}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter Address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter City" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter Zip Code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <ImageUploadField
                        id="coverImage"
                        label="Cover Image (200px X 200px)"
                        onChange={(e) => handleImageUpload(e, "coverImage")}
                        loading={uploadState.coverImage.loading}
                        progress={uploadState.coverImage.progress}
                        previewUrl={uploadState.coverImage.preview}
                      />
                    </div>
                    <div>
                      <ImageUploadField
                        id="logo"
                        label="Logo (200px X 200px)"
                        onChange={(e) => handleImageUpload(e, "logo")}
                        loading={uploadState.logo.loading}
                        progress={uploadState.logo.progress}
                        previewUrl={uploadState.logo.preview}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <Button
                      type="submit"
                      className="w-3/12 bg-purple-600 hover:bg-purple-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Portfolio</h2>
            </CardHeader>
            <CardContent>
              <PortfolioForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </FormProvider>
  );
}

export default ProfilePage;
