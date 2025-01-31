import AlbumDetailsCard from "@/components/AlbumDetailsCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogTrigger, Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import useAlbum from "@/store/useAlbum";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import DeleteDialog from "@/components/DeleteDialog";
import { useState } from "react";
import Link from "next/link";

export const albumColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link href={`/dashboard/album?albumId=${row.getValue("id")}`}>
        <p className="text-blue-600 underline">{row.getValue("id")}</p>
      </Link>
    ),
  },
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "action",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "contactPerson",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Person Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    Cell: ({ row }) => {
      return <span>{row.getValues("contactPerson")}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="w-full">
        {format(new Date(row.getValue("createdAt")), "PPpp")}
      </span>
    ),
  },
  {
    accessorKey: "actionId",
    header: "Actions",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      const { getAlbumDetailsById, album, deleteAlbum } = useAlbum();
      return (
        <div className="flex">
          <Dialog className="w-10/12">
            <DialogTrigger asChild>
              <Button
                type="button"
                onClick={() => {
                  getAlbumDetailsById(row.getValue("actionId"));
                }}
                variant="ghost"
                className="text-purple-500 hover:text-purple-700"
              >
                Share
              </Button>
            </DialogTrigger>
            <AlbumDetailsCard album={album} />
          </Dialog>
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
                deleteAlbum(row.getValue("actionId"));
                setOpen(false);
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
