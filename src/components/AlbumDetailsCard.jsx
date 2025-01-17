import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Share2, Copy, MessageCircle } from "lucide-react";

const AlbumDetailsCard = ({ album }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const downloadAppLink = `https://app.ealbum.com/get?code=${album.code}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Album details copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    console.log("Sharing to:", phoneNumber);
  };
  return (
    <DialogContent className="max-w-md p-0 overflow-hidden rounded-lg">
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-800">
        <DialogTitle className="text-white flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share {album.action}
        </DialogTitle>
      </DialogHeader>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Share your album via any of these methods:
          </p>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-purple-900">{album.name}</h3>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border">
                <span className="text-sm text-gray-600">Access Code:</span>
                <span className="font-mono font-medium">{album.code}</span>
              </div>
              <p className="text-sm text-purple-700">
                Download app:{" "}
                <span className="underline">{downloadAppLink}</span>
              </p>
            </div>

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
              onClick={() =>
                copyToClipboard(
                  `${album.nameu}\nAlbum Access Code: ${album.code}\nDownload app: ${downloadAppLink}`
                )
              }
            >
              {isCopied ? (
                <>
                  <Copy className="h-4 w-4 text-purple-200" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Details
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500 text-xs uppercase tracking-wider">
              or send via SMS
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="pl-10"
                maxLength={10}
              />
              <MessageCircle className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 transition-all duration-300"
              onClick={handleShare}
              disabled={phoneNumber.length !== 10}
            >
              Send SMS
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default AlbumDetailsCard;
