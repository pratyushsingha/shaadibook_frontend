"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { BadgePlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function ProjectManagement() {
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState("");
  const { toast } = useToast();

  const handleCreateProject = () => {
    if (projectTitle.trim()) {
      router.push(
        `/dashboard/album/create?title=${encodeURIComponent(projectTitle)}`
      );
    } else {
      toast({
        variant: "destructive",
        title: "Project Title is required",
      });
    }
  };
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Top Section */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 border rounded-lg px-4 py-2 min-w-[200px]">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            →
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Creation</div>
            <div>1</div>
          </div>
        </div>

        <div className="flex items-center gap-2 border rounded-lg px-4 py-2 border-purple-500 text-purple-600 cursor-pointer hover:bg-purple-50">
          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
            +
          </div>
          <div>
            <div className="text-sm">eAlbum Credits</div>
            <div>Buy Credits</div>
          </div>
        </div>

        <div className="flex items-center gap-2 border rounded-lg px-4 py-2">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            📞
          </div>
          <div>
            <div className="text-sm text-gray-600">For support contact</div>
            <div>+918738593947</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex gap-2">
          <Input
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Enter Project/Event Title"
            className="rounded-md border-gray-300"
          />
          <Button onClick={handleCreateProject} className="space-x-3 px-6">
            <BadgePlus />
            Create Project
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Enter Project/Event Code"
            className="rounded-md border-gray-300"
          />
          <Button className="bg-purple-600 hover:bg-purple-700 rounded-md px-6">
            Import Project
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm">Show Entries</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-[70px] h-8 rounded border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Input
              placeholder="Search"
              className="w-[300px] rounded border-gray-300 pr-8"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2">
              🔍
            </button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-600 py-3">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">
                  Code
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">
                  Action
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">
                  Title
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">
                  Person Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">
                  Contact No.
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">
                  Created On
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="text-sm">1</TableCell>
                <TableCell className="text-sm">ID7497789795</TableCell>
                <TableCell className="text-sm">eAlbum</TableCell>
                <TableCell className="text-sm">Akash + Anji</TableCell>
                <TableCell className="text-sm">Mansi Bhutia</TableCell>
                <TableCell className="text-sm">+917944535722</TableCell>
                <TableCell className="text-sm">2023-03-09 11:04:30</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-purple-600 cursor-pointer">
                      Share
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-purple-600 cursor-pointer">
                      Delete
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center gap-2">
          <button className="px-4 py-1 text-sm border rounded hover:bg-gray-50">
            Previous
          </button>
          <button className="px-4 py-1 text-sm border rounded bg-purple-600 text-white">
            1
          </button>
          <button className="px-4 py-1 text-sm border rounded hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>

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
