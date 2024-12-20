import { TabOverview, TabStatus } from "@/types/types"
import { ColumnDef } from "@tanstack/react-table"
import { Format24hTime, GetActiveDayAcronyms, FormatDateMMDDYYYY } from "@/util/dates"
import React from "react"
import { BadgeAlert, Check } from "lucide-react"
import { Badge } from "../ui/badge"
import { filterInArray } from "./table"

export function useTabColumns(shopId: number): ColumnDef<TabOverview>[] {
  return React.useMemo(() => [
    {
      accessorKey: "id",
    },
    {
      accessorKey: "display_name",
      header: "Tab",
      cell: ({ row }) => {
        const tab = row.original
        return <div className="whitespace-nowrap">{tab.display_name}</div>
      },
      sortingFn: 'fuzzy',
    },
    {
      id: "updates",
      cell: ({ row }) => {
        const tab = row.original
        return <div className="font-bold text-center">
          {tab.pending_updates ? <BadgeAlert /> : ""}
        </div>
      }
    },
    {
      accessorKey: "status",
      header: () => <div className="">Status</div>,
      cell: ({ row }) => {
        const tab = row.original
        return <div className="">
          <Badge
            variant={tab.status === TabStatus.pending ? "default" : "outline"}>{tab.status}</Badge>
        </div>
      },
      filterFn: filterInArray
    },
    {
      accessorKey: "is_pending_balance",
      header: () => <div className="">Balance</div>,
      cell: ({ row }) => {
        const tab = row.original
        return <div className="flex justify-center items-center">
          {tab.is_pending_balance ? <span className="font-bold text-destructive text-lg">!</span> : <Check className="w-4 h-4" />}
        </div>
      },
      filterFn: filterInArray
    },
    {
      accessorKey: "organization",
      header: "Organization",
    },
    {
      accessorKey: "locations",
      header: () => <div>Locations</div>,
      cell: ({ row }) => {
        const tab = row.original
        return <div className="whitespace-nowrap">{tab.locations.map(v => v.name).join(", ")}</div>

      }
    },
    {
      accessorKey: "active_days_of_wk",
      header: "Active Days of the Week",
      cell: ({ row }) => {
        const tab = row.original
        return <div className="whitespace-nowrap">{GetActiveDayAcronyms(tab.active_days_of_wk).join(", ")}</div>
      }
    },
    {
      accessorKey: "start_date",
      header: () => <div className="">Start Date</div>,
      cell: ({ row }) => {
        const tab = row.original
        return <div className="">{FormatDateMMDDYYYY(tab.start_date)}</div>
      }
    },
    {
      accessorKey: "end_date",
      header: () => <div className="">End Date</div>,
      cell: ({ row }) => {
        const tab = row.original
        return <div className="">{FormatDateMMDDYYYY(tab.end_date)}</div>
      }
    },
    {
      accessorKey: "daily_start_time",
      header: () => <div className="">Daily Start Time</div>,
      cell: ({ row }) => {
        const tab = row.original
        return <div className="">{Format24hTime(tab.daily_start_time)}</div>
      }

    },
    {
      accessorKey: "daily_end_time",
      header: () => <div className="">Daily End Time</div>,
      cell: ({ row }) => {
        const tab = row.original
        return <div className="">{Format24hTime(tab.daily_end_time)}</div>
      }
    },
    {
      accessorKey: "billing_interval_days",
      header: () => <div >Billing Interval</div>,
      cell: ({ row }) => {
        const tab = row.original
        return <div className="">{tab.billing_interval_days} days</div>
      }
    },
    {
      accessorKey: "payment_method",
      header: "Payment Method",
      filterFn: filterInArray
    },
    {
      accessorKey: "payment_details",
      header: "Payment Details",
      cell: ({ row }) => {
        const tab = row.original
        return tab.payment_details ?? "None"
      }
    },
  ] satisfies ColumnDef<TabOverview>[], [shopId])
}
