import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { Button } from "../../ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import usePlan from "../../../store/usePlan";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DeleteDialog from "@/components/DeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PlanUpdateForm from "../../forms/updatePlanForm";

export const planColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="text-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("price");
      return <div className="text-center">{amount ? `₹ ${amount}` : "-"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <div className="text-center">
          <Badge
            className={`${
              status === "PENDING"
                ? "bg-yellow-500"
                : status === "ACTIVE"
                ? "bg-green-500"
                : status === "EXPIRED"
                ? "bg-red-400"
                : "bg-red-500"
            }`}
          >
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "planType",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Duration (in Days)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <div className="text-center">
        <Button variant="ghost">Created At</Button>
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt");
      return (
        <div className="text-center">
          {formatDistance(new Date(date), new Date(), { addSuffix: true })}
        </div>
      );
    },
  },
  {
    accessorKey: "actionId",
    header: () => (
      <div className="text-center">
        <Button variant="ghost">Actions</Button>
      </div>
    ),
    cell: ({ row }) => {
      const { toast } = useToast();
      const [open, setOpen] = useState(false);
      const planId = row.getValue("actionId");
      const { deletePlan, error, updatePlanError, planDetailsLoading } =
        usePlan();

      const handlePlanDelete = async (planId) => {
        const response = await deletePlan(planId);
        setOpen(false);
        if (response) {
          toast({
            title: "Plan archived successfully",
          });
        }
      };

      useEffect(() => {
        if (error || updatePlanError || planDetailsLoading) {
          toast({
            variant: "destructive",
            title:
              error ||
              updatePlanError ||
              planDetailsLoading ||
              "Something went wrong",
          });
        }
      }, [error, toast, updatePlanError]);

      return (
        <div className="flex justify-center items-center space-x-2">
          <Link href={`/admin/dashboard/plans/update?id=${planId}`}>
            <Button
              type="button"
              className="text-purple-500 hover:text-purple-700"
              variant="ghost"
            >
              View
            </Button>
          </Link>
          <Separator orientation="vertical" />
          <Dialog open={open} onOpenChange={setOpen} className="w-10/12">
            <DialogTrigger>
              <Button
                onClick={() => setOpen(true)}
                variant="ghost"
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </Button>
            </DialogTrigger>
            <DeleteDialog
              action={() => {
                handlePlanDelete(planId);
              }}
              btnTxt="Delete"
              linkHref="/dashboard"
              description="Are You Sure Want To Delete Album ?"
              redRightBtn={false}
            />
          </Dialog>
        </div>
      );
    },
  },
];
