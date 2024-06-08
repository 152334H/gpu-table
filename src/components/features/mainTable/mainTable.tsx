import type { GPUData } from "./mainTable";
import { useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import GPUDataJSON from "@/assets/gpu_data.json";
import { Button } from "@/components/ui/button";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import debounce from "lodash.debounce";
import { Checkbox } from "@/components/ui/checkbox";
import { FaEyeSlash } from "react-icons/fa6";
import { accessorToFullNameMapping, stringifyVisibilityObj } from "./utils";
import { FaXmark } from "react-icons/fa6";

const NAText: React.FC = () => {
  return <span className="text-slate-500">N/A</span>;
};

interface DisplayProps {
  value: number;
  className?: string;
}
const KBDisplay: React.FC<DisplayProps> = ({ value, className }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`whitespace-nowrap ${className}`}>
          {Math.round(value / 1000)} <span className="text-primary">KB</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className={`whitespace-nowrap ${className}`}>
          {(value / 1000).toFixed(3)} <span className="text-primary">KB</span>
        </span>
      </TooltipContent>
    </Tooltip>
  );
};

const GBDisplay: React.FC<DisplayProps> = ({ value, className }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`whitespace-nowrap ${className}`}>
          {(value / 1000000000).toFixed(1)}{" "}
          <span className="text-primary">GB</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className={`whitespace-nowrap ${className}`}>
          {(value / 1000000000).toFixed(3)}{" "}
          <span className="text-primary">GB</span>
        </span>
      </TooltipContent>
    </Tooltip>
  );
};

const TFlopsDisplay: React.FC<DisplayProps> = ({ value, className }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`whitespace-nowrap ${className}`}>
          {(value / 1000000000000).toFixed(2)}{" "}
          <span className="text-primary">TFLOPS</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className={`whitespace-nowrap ${className}`}>
          {(value / 1000000000000).toFixed(10)}{" "}
          <span className="text-primary">TFLOPS</span>
        </span>
      </TooltipContent>
    </Tooltip>
  );
};

export const MainTable: React.FC = () => {
  const [factorInCripple, setFactorInCripple] = useState(true);

  const columns = useMemo<ColumnDef<GPUData>[]>(
    () => [
      {
        accessorKey: "name",
        cell: (info) => info.getValue(),
        header: () => <span>Name</span>,
      },
      {
        accessorKey: "tdp",
        cell: (info) => (
          <span className="whitespace-nowrap">
            {info.getValue() as string} <span className="text-primary">W</span>
          </span>
        ),
        header: () => <span className="whitespace-nowrap">TDP (W)</span>,
      },
      {
        accessorKey: "sms",
        cell: (info) => info.getValue(),
        header: () => <span>SMs</span>,
      },
      {
        accessorKey: "vram",
        cell: (info) => <GBDisplay value={info.getValue() as number} />,
        header: () => <span>VRAM</span>,
      },
      {
        accessorKey: "membw",
        cell: (info) => <GBDisplay value={info.getValue() as number} />,
        header: () => <span>Memory Bandwidth</span>,
      },
      {
        accessorKey: "cores_cuda",
        cell: (info) => info.getValue(),
        header: () => <span>CUDA Cores</span>,
      },
      {
        accessorKey: "cores_tensor",
        cell: (info) => info.getValue(),
        header: () => <span>Tensor Cores</span>,
      },
      {
        accessorKey: "register_size",
        cell: (info) => <KBDisplay value={info.getValue() as number} />,
        header: () => <span>Register Size</span>,
      },
      {
        accessorKey: "cache_l1",
        cell: (info) =>
          info.getValue() !== null ? (
            <KBDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>L1 Cache</span>,
      },
      {
        accessorKey: "cache_l2",
        cell: (info) =>
          info.getValue() !== null ? (
            <KBDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>L2 Cache</span>,
      },
      {
        accessorKey: "fp32_general",
        cell: (info) => <TFlopsDisplay value={info.getValue() as number} />,
        header: () => <span>FP32 Performance</span>,
      },
      {
        accessorKey: factorInCripple ? "fp16" : "fp16_ignore_crippled",
        cell: (info) => <TFlopsDisplay value={info.getValue() as number} />,
        header: () => <span>FP16 Performance</span>,
      },
      {
        accessorKey: factorInCripple ? "bf16" : "bf16_ignore_crippled",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>BF16 Performance</span>,
      },
      {
        accessorKey: "tf32",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>TF32 Performance</span>,
      },
      {
        accessorKey: "int8",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>INT8 Performance</span>,
      },
      {
        accessorKey: "int4",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>INT4 Performance</span>,
      },
      {
        accessorKey: factorInCripple ? "fp8" : "fp8_ignore_crippled",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>FP8 Performance</span>,
      },
      {
        accessorKey: "fp6",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>FP6 Performance</span>,
      },
      {
        accessorKey: "fp4",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>FP4 Performance</span>,
      },
      {
        accessorKey: "crippled_fp32acc",
        cell: (info) =>
          info.getValue() ? (
            <Badge variant="destructive">Crippled</Badge>
          ) : (
            <Badge variant={"success"}>Good</Badge>
          ),
        header: () => <span>Crippled FP32 Accuracy</span>,
      },
      {
        accessorKey: "citation",
        cell: (info) => (
          <Button
            size="sm"
            onClick={() => {
              const newTab = window.open(info.getValue() as string, "_blank");
              if (newTab) newTab.focus();
            }}
          >
            Link
          </Button>
        ),
        header: () => <span>Citation</span>,
      },
    ],
    [factorInCripple],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]); // can set initial column filter state here
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    citation: true,
    tdp: true,
    membw: true,
    vram: true,
    sms: false,
    cores_cuda: false,
    cores_tensor: false,
    register_size: false,
    cache_l1: false,
    cache_l2: false,
    fp32_general: true,
    fp16: true,
    bf16: false,
    tf32: false,
    int8: false,
    int4: false,
    fp8: false,
    fp6: false,
    fp4: false,
    crippled_fp32acc: true,
  });

  const table = useReactTable({
    data: GPUDataJSON as GPUData[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      pagination,
      columnFilters,
      columnVisibility,
    },
    autoResetPageIndex: true,
    onColumnFiltersChange: setColumnFilters,
  });

  const debouncedSet = debounce(setColumnFilters, 250);

  return (
    <div className="p-2 md:p-5 w-full h-max glassy-bg  lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl">
      <div className="mb-3 flex flex-col md:flex-row">
        <Input
          onChange={(e) =>
            debouncedSet([{ id: "name", value: e.target.value }])
          }
          placeholder="Search GPU Names..."
        />
        <Separator orientation="vertical" className="hidden  md:visible h-4" />
        <div
          onClick={() => {
            setFactorInCripple(!factorInCripple);
          }}
          className="cursor-pointer transition-all hover:opacity-50 flex items-center justify-center mt-3 md:mt-0 md:ml-4"
        >
          <Checkbox checked={factorInCripple} className="mr-2" />{" "}
          <span>Factor in Crippled FP32 Performance</span>
        </div>
      </div>
      <div className="mb-2 md:mb-4 flex flex-col md:flex-row">
        <span className="flex items-center mr-2">
          <span className="whitespace-nowrap text-primary">Hidden Columns</span>{" "}
          <FaEyeSlash className="ml-1 text-slate-300" />:
        </span>
        <div>
          {Object.keys(columnVisibility).map((colName) => {
            if (!columnVisibility[colName]) {
              return (
                <Badge
                  key={colName}
                  onClick={() => {
                    columnVisibility[colName] = true;
                    setColumnVisibility(
                      JSON.parse(stringifyVisibilityObj(columnVisibility)),
                    );
                  }}
                  className="ml-1 cursor-pointer animate-in fade-in"
                >
                  <span className="flex items-center">
                    {accessorToFullNameMapping[colName]}{" "}
                    <FaXmark className="ml-1 text-red-600" />
                  </span>
                </Badge>
              );
            }
            return null;
          })}
        </div>
      </div>
      <Table>
        <TableHeader className="bg-neutral-800 bg-opacity-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    className="p-1"
                    key={header.id}
                    colSpan={header.colSpan}
                  >
                    <div className="flex items-center">
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center justify-center text-center p-2 transition-opacity hover:opacity-50"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        <span className="font-bold bg-gradient-to-br from-[#ffd194] to-[#70e1f5] text-transparent bg-clip-text">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        <span className="ml-1 block">
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      </div>
                      <Button
                        onClick={() => {
                          columnVisibility[header.id] = false;
                          setColumnVisibility(
                            JSON.parse(
                              stringifyVisibilityObj(columnVisibility),
                            ),
                          );
                        }}
                        variant="ghost"
                        size="xs"
                      >
                        <FaEyeSlash />
                      </Button>
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            return (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex flex-col md:flex-row items-center gap-2 mt-2">
        <div className="flex mb-3 md:mb-0">
          <Button
            className="mr-1"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FaAngleLeft />
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <FaAngleRight />
          </Button>

          <span className="flex items-center gap-1 ml-3">
            Page:
            <Input
              type="number"
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 rounded w-16 mr-1"
            />
            of{" "}
            <span className="text-primary font-bold">
              {table.getPageCount().toLocaleString()}
            </span>
          </span>
        </div>
        <Separator
          orientation="vertical"
          className="hidden md:block bg-slate-300 h-9 mx-1"
        />
        <Select
          value={table.getState().pagination.pageSize.toString()}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {[10, 20].map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize.toString()}>
                Show {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div>
          Showing{" "}
          <span className="text-primary font-bold">
            {table.getRowModel().rows.length.toLocaleString()}
          </span>{" "}
          of{" "}
          <span className="text-primary font-bold">
            {table.getRowCount().toLocaleString()}
          </span>{" "}
          GPUs
        </div>
      </div>
    </div>
  );
};
