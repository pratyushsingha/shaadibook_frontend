"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeInfo, Delete, Loader2 } from "lucide-react";
import useAuth from "../../../store/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "../../../hooks/use-toast";
import DeleteDialog from "@/components/DeleteDialog";
const page = () => {
  const { logout, error, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
    });
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };
  return (
    <Dialog open={true}>
      <DeleteDialog
        action={() => handleLogout()}
        loading={loading}
        btnTxt="Sign Out"
        linkHref="/dashboard"
        redCancelBtn={true}
        description="Are You Sure Want To Sign-out ?"
      />
    </Dialog>
  );
};

export default page;
