"use client";

import { ArrowLeft, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateAlbumPage() {
  return (
    <>
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" asChild>
            <a href="#">Back</a>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">Copy And Share</Button>
            <Button>Save Album</Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">
              Add More Details About Album
            </h2>

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
                  <Input value="Akash + Anjali" readOnly />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="studio-name">Studio Name</Label>
                  <Input id="studio-name" placeholder="Enter Studio Name" />
                </div>
                <div>
                  <Label htmlFor="contact-person1">Studio Contact Person</Label>
                  <Input
                    id="contact-person1"
                    placeholder="Enter Customer Name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-person2">Studio Contact Person</Label>
                  <Input
                    id="contact-person2"
                    placeholder="Enter Customer Name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Song(Will play while viewing album)</Label>
                  <Input type="file" className="cursor-pointer" />
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="email">Email IDs (seperate by comma)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter Email IDs"
                    />
                  </div>
                  <Button className="flex-shrink-0">Send Mail</Button>
                </div>
              </div>

              <div className="flex items-start gap-8">
                <div className="flex items-center space-x-2">
                  <Checkbox id="attach" />
                  <Label htmlFor="attach">Attach My Profile To eAlbum</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="single" />
                  <Label htmlFor="single">Single Sided</Label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Upload Album Images</h3>
                  <Button variant="outline">+ Add New Category</Button>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  {["Engagement", "Haldi", "Birthday Party", "Marriage"].map(
                    (category) => (
                      <div key={category}>
                        <Label>{category}</Label>
                        <Input type="file" className="cursor-pointer" />
                      </div>
                    )
                  )}
                </div>
              </div>

              <Card className="bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Akash + Anjli</p>
                      <p className="text-sm text-muted-foreground">
                        Album Access Code: 109897B995
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Download app: http://hhdvjd4t5vjjws
                      </p>
                      <p className="text-sm text-muted-foreground">
                        - For User.
                      </p>
                    </div>
                    <Button>Copy And Share</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
