"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BuyCreditsModal from "../../../components/BuyCredits";

export default function CreditDetailsPage() {
  return (
    <>
      <main className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">History</h2>
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Buy eAlbum Credits
                  </Button>
                  <BuyCreditsModal />
                </DialogTrigger>
              </Dialog>

              <Button className="bg-purple-600 hover:bg-purple-700">
                Buy Alive Print(Video) Credits
              </Button>
            </div>
          </div>

          <Card>
            <Tabs defaultValue="credits" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="credits"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-600 data-[state=active]:bg-transparent"
                >
                  Credits Buy History
                </TabsTrigger>
                <TabsTrigger
                  value="coupons"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-600 data-[state=active]:bg-transparent"
                >
                  Redeem Coupons History
                </TabsTrigger>
              </TabsList>

              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Show Entries:</span>
                    <Select defaultValue="10">
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="10" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9 w-[300px]" placeholder="Search" />
                  </div>
                </div>

                <TabsContent value="credits" className="m-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead>Order Id</TableHead>
                          <TableHead>Product Type</TableHead>
                          <TableHead>Number Of Credits</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell>Order_1646753366</TableCell>
                          <TableCell>eAlbum(ebook)</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell>160</TableCell>
                          <TableCell>Txn Success</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          </TableCell>
                          <TableCell>2022-03-08 20:59:26</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <Button variant="outline" disabled>
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="bg-purple-600 text-white hover:bg-purple-700"
                      >
                        1
                      </Button>
                    </div>
                    <Button variant="outline" disabled>
                      Next
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="coupons" className="m-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead>Coupon Code</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No records found
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </main>
    </>
  );
}
