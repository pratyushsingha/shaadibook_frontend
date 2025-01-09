"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function ProfilePage() {
  return (
    <>
      <main className="flex-1 overflow-auto p-6 bg-gray-100">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Basic Profile</h2>
            </CardHeader>
            <CardContent>
              <form className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studio-name">Studio Name</Label>
                    <Input id="studio-name" defaultValue="Alankaran Studios" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="your-name">Your Name</Label>
                    <Input id="your-name" defaultValue="Priyank Suthar" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Id(User Id)</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="Demo123@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      defaultValue="••••••••"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact No</Label>
                    <Input id="contact" defaultValue="9426426738" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="about">
                      About Business/You(Upto 200 Characters)
                    </Label>
                    <Textarea
                      id="about"
                      placeholder="Enter About Details"
                      className="resize-none"
                      rows={1}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Enter Address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Enter City" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" defaultValue="India" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input id="zip" placeholder="Enter Zip Code" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cover">Cover Image (800px X 300px)</Label>
                    <Input id="cover" type="file" className="cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo (200px X 200px)</Label>
                    <Input id="logo" type="file" className="cursor-pointer" />
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  <Button className="w-3/12 bg-purple-600 hover:bg-purple-700">
                    Update
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Portfolio</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Upload Portfolio Images</Label>
                  <Input type="file" className="cursor-pointer" multiple />
                </div>
                <div className="flex justify-end">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Save Portfolio
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

export default ProfilePage;
