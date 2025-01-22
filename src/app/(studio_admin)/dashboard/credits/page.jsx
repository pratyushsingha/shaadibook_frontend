"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BuyCreditsModal from "@/components/BuyCredits";
import useSubscription from "@/store/useSubscription";
import { DataTable } from "@/components/tables/data-table";
import { studioSubscriptionHistoryColumns } from "@/components/tables/subscribers/studioSubscriptionHistoryColumn";

export default function CreditDetailsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    createSubscriptionLoader,
    getSubscriptionHistoryForStudio,
    subscriptionHistoryLoader,
    subscriptionHistoryError,
    subscriptionHistory,
  } = useSubscription();

  useEffect(() => {
    getSubscriptionHistoryForStudio();
  }, []);
  return (
    <>
      <main className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">History</h2>
            <div className="flex gap-3">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger>
                  <Button
                    disabled={createSubscriptionLoader}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {createSubscriptionLoader && (
                      <Loader2 className="animate-spin" />
                    )}
                    Buy Alive Print(Video) Credits
                  </Button>
                </DialogTrigger>
                <BuyCreditsModal
                  dialogOpen={dialogOpen}
                  setDialogOpen={setDialogOpen}
                />
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
                </div>

                <TabsContent value="credits" className="m-0">
                  <DataTable
                    columns={studioSubscriptionHistoryColumns}
                    data={subscriptionHistory}
                  />
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
