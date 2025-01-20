"use client";

import { Dialog } from "@/components/ui/dialog";
import useAuth from "@/store/useAuth";
import { useRouter } from "next/navigation";
import DeleteDialog from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
const page = () => {
  const { logout, error, loading, user } = useAuth();
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
        linkHref={`${
          user?.role === "STUDIO_ADMIN" ? "/dashboard" : "/admin/dashboard"
        }`}
        redCancelBtn={true}
        description="Are You Sure Want To Sign-out ?"
      />
    </Dialog>
  );
};

export default page;
