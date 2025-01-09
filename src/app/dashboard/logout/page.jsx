"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeInfo } from "lucide-react";
import useAuth from "../../../store/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "../../../hooks/use-toast";

const page = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
    })
    setTimeout(() => {
      router.push("/login")
    }, 3000);
  }
  return (
    <Dialog open={true}>
      <DialogContent className="flex flex-col justify-center items-center my-10">
        <DialogTitle className="">
          <BadgeInfo className="h-16 w-16 text-purple-500 justify-center" />
        </DialogTitle>
        <DialogDescription className="text-xl">
          Are You Sure Want To Sign-out ?
        </DialogDescription>
        <div className="flex justify-between space-x-4">
          <Button onClick={() => handleLogout()}>Sign Out</Button>
          <Button
            variant="ghost"
            className="border border-red-600 text-red-500 hover:text-red-500"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default page;
