"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ActionCard from "@/components/ActionCard";
import { albumColumns } from "@/components/tables/album/albumColumns";
import { DataTable } from "@/components/tables/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { BadgePlus, Loader2, Phone, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import useAlbum from "@/store/useAlbum";
import Loader from "@/components/loader/Loader";
import { withRoleProtection } from "../../../components/withRoleProtection";
import useSubscription from "../../../store/useSubscription";

function page() {
  const { fetchStudioAlbums, pagination, albums, loading, error } = useAlbum();
  const { getStudioActiveSubsciption, studioActiveSubscriptions, studi } =
    useSubscription();
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState("");
  const { toast } = useToast();
  const [albumCreateLoader, setAlbumCreateLoader] = useState(false);

  const handleCreateProject = () => {
    setAlbumCreateLoader(true);

    if (projectTitle.trim()) {
      setTimeout(() => {
        router.push(
          `/dashboard/album/create?title=${encodeURIComponent(projectTitle)}`
        );
      }, 100);
    } else {
      toast({
        variant: "destructive",
        title: "Project Title is required",
      });
      setAlbumCreateLoader(false);
    }
  };
  useEffect(() => {
    fetchStudioAlbums();
    getStudioActiveSubsciption();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;
  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <div className="flex flex-wrap gap-4">
        <ActionCard
          icon={<Plus className="h-5 w-5 text-purple-600" />}
          title="Total Creation"
          description={pagination?.total}
          descriptionBg="black"
        />
        <ActionCard
          icon={<Plus className="h-5 w-5 text-purple-600" />}
          title="eAlbum Credits"
          description="Buy Credits"
          descriptionBg="text-purple-500"
        />
        <ActionCard
          icon={<Phone className="h-5 w-5 text-purple-600" />}
          title="For Support Contact"
          description="+91 9830355637"
          descriptionBg="text-purple-500"
        />

        <ActionCard
          icon={<Phone className="h-5 w-5 text-purple-600" />}
          title="Active Subscription"
          description="+91 9830355637"
          descriptionBg="text-purple-500"
        />
      </div>
      <Card className="py-10 bg-[#FBF9FC]">
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Enter Project/Event Title"
              />
              <Button
                disabled={albumCreateLoader}
                onClick={handleCreateProject}
                className="space-x-3 px-6"
              >
                <BadgePlus />
                {albumCreateLoader ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Enter Project/Event Code" />
              <Button className="bg-purple-600 hover:bg-purple-700 rounded-md px-6">
                Import Project
              </Button>
            </div>
          </div>
          <h3 className="text-xl font-bold py-4">Your Projects</h3>
          <DataTable columns={albumColumns} data={albums} />
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">How To Create eAlbum?</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium text-sm">Create Project</h4>
                <p className="text-sm text-gray-500">
                  Click on "Create Project" button by entering Project Name(i.e.
                  XYZ with ABC)
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium text-sm">
                  Click On "Create EAlBUM" Button
                </h4>
                <p className="text-sm text-gray-500">
                  Click on Create eAlbum button to open album upload page.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium text-sm">Upload Images And Share</h4>
                <p className="text-sm text-gray-500">
                  Upload Album images, enter detail and hit Save button. Now
                  send unique code to your customer with app link showing at
                  bottom.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">
            How to create Alive Prints/Video Book?
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium text-sm">Create Project</h4>
                <p className="text-sm text-gray-500">
                  Click on "Create Project" button by entering Project Name(i.e.
                  XYZ with ABC). You can create multiple project and store.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium text-sm">Upload Photo And Video</h4>
                <p className="text-sm text-gray-500">
                  Upload photo and recorded video from your computer. You can
                  select multiple photos.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium text-sm">Share Unique Code</h4>
                <p className="text-sm text-gray-500">
                  Now send unique code to your customer with app link showing at
                  bottom of that page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRoleProtection(page, ["STUDIO_ADMIN"]);
