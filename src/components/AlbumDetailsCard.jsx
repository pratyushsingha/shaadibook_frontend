import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Share2,
  Download,
  Users,
  Image,
  Video,
  Mail,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AlbumDetailsCard = ({ album }) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyShare = () => {
    const shareText = `
Album: ${album.name}
Access Code: ${album.code}
Download app: http://hhdvjd4t5vjjws

For viewing your photos and videos, please:
1. Download the app
2. Enter the access code: ${album.code}
`;
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    toast({
      title: "Share info copied to clipboard",
      description: "You can now paste and share it",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!album || Object.keys(album).length <= 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg">
      <CardHeader className="border-b border-purple-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-purple-900">
            Album Created Successfully
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleCopyShare}
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {isCopied ? "Copied!" : "Copy & Share"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="w-full">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Album Details
              </h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Name:</span> {album.name}
                </p>
                <p className="flex items-center gap-2 text-purple-700 font-mono bg-purple-100 p-2 rounded">
                  <span className="font-medium">Access Code:</span> {album.code}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Contact Information
              </h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Contact Persons:</span>
                  {album.contactPerson.join(", ")}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Email:</span>
                  {album.emailIds.join(", ")}
                </p>
              </div>
            </div>
          </div>{" "}
        </div>

        <div className="mt-6 p-4 bg-purple-100 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            How to Access
          </h3>
          <div className="space-y-2 text-purple-800">
            <p className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download app: http://hhdvjd4t5vjjws
            </p>
            <p className="text-sm text-purple-600">
              Share this information with your clients to give them access to
              the album.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlbumDetailsCard;
