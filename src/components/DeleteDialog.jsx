import Link from "next/link";
import { DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { BadgeInfo, Loader2 } from "lucide-react";

const DeleteDialog = ({
  action,
  loading,
  btnTxt,
  linkHref,
  description,
  redRightBtn,
}) => {
  console.log(redRightBtn)
  return (
    <DialogContent className="flex flex-col justify-center items-center my-10">
      <DialogTitle className="">
        <BadgeInfo className="h-16 w-16 text-purple-500 justify-center" />
      </DialogTitle>
      <DialogDescription className="text-xl">{description}</DialogDescription>
      <div className="flex justify-between space-x-4">
        <Button
          className={`${
            redRightBtn
              ? ""
              : "border border-red-600 text-red-500 hover:text-red-500"
          }`}
          onClick={action}
        >
          {loading ? <Loader2 className="animate-spin" /> : btnTxt}
        </Button>
        <Link href={linkHref}>
          <Button
            variant="ghost"
            className={`${
              redRightBtn
                ? "border border-red-600 text-red-500 hover:text-red-500"
                : "text-purple-500 hover:text-purple-700"
            }`}
          >
            Cancel
          </Button>
        </Link>
      </div>
    </DialogContent>
  );
};

export default DeleteDialog;
