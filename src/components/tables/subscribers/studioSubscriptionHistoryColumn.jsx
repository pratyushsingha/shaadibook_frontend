import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";

export const studioSubscriptionHistoryColumns = [
  {
    accessorFn: (row) => row.plan?.name,
    header: "Plan",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount");
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(amount / 100);

      return formatted;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-medium hover:bg-transparent"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
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
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-center">
        {row.getValue("endDate") === null ? "ONE TIME" : "RECURRING"}
      </span>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.getValue("startDate");
      if (!date) return "-";
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.getValue("endDate");
      if (!date) return "-";
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt");
      return formatDistance(new Date(date), new Date(), { addSuffix: true });
    },
  },
  {
    accessorFn: (row) => row.plan?.planType,
    header: "Plan Type",
    cell: ({ row }) => {
      const type = row.original.plan?.type;
      return (
        <Badge variant="outline">
          {type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
];
