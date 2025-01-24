"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/store/useAuth";

export default function ShareDialog({ album }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const downloadAppLink = `https://${user?.studioName}.ealbum.com/get?code=${album?.code}`;

  const copyToClipboard = () => {
    const text = `${album.name}\nAlbum Access Code: ${album.code}\nDownload app: ${downloadAppLink}`;
    navigator.clipboard.writeText(text);
    toast({
      description: "Copied to clipboard",
      duration: 2000,
    });
  };

  const handleShare = () => {
    console.log("Sharing to:", phoneNumber);
    // Implement SMS sharing logic here
  };

  return (
    <DialogContent className="max-w-md p-6">
      <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <DialogTitle>Share Event Id</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Copy text given below share it via your favorite sharing application.
        </p>

        <div className="space-y-2">
          <p className="text-sm">{album.name}</p>
          <p className="text-sm">Album Access Code: {album.code}</p>
          <p className="text-sm">
            Download app:{" "}
            <span className="text-purple-600">{downloadAppLink}</span>
          </p>
        </div>

        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          onClick={copyToClipboard}
        >
          Copy & Share
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-muted-foreground">OR</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm">Send SMS :</p>
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="Enter 10 digit mobile number"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              maxLength={10}
            />
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap"
              onClick={handleShare}
              disabled={phoneNumber.length !== 10}
            >
              Copy & Share
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
