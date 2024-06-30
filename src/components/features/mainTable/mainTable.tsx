import type { GPUData, SettingsObj } from "./mainTable";
import { useState, useMemo, useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import debounce from "lodash.debounce";
import { Checkbox } from "@/components/ui/checkbox";
import { FaEyeSlash } from "react-icons/fa6";
import {
  GPULocalStorageName,
  accessorToFullNameMapping,
  stringifyVisibilityObj,
} from "./utils";
import { FaXmark } from "react-icons/fa6";
import { CrippledWarningDialog } from "./crippledWarning";

const NAText: React.FC = () => {
  return <span className="text-slate-500">N/A</span>;
};

interface DisplayProps {
  value: number;
  className?: string;
}
interface CrippledNonCrippledProps {
  value: number;
  crippledVal: number;
}
const KBDisplay: React.FC<DisplayProps> = ({ value, className }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return (
    <Tooltip
      open={tooltipOpen}
      onOpenChange={(state) => {
        if (value) setTooltipOpen(state);
      }}
    >
      <TooltipTrigger asChild>
        <span className={`whitespace-nowrap ${className}`}>
          {value ? (
            <>
              {Math.round(value / 1000)}{" "}
              <span className="text-primary text-sm">KB</span>
            </>
          ) : (
            <span className="text-slate-500 text-sm">None</span>
          )}
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
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return (
    <Tooltip
      open={tooltipOpen}
      onOpenChange={(state) => {
        if (value) setTooltipOpen(state);
      }}
    >
      <TooltipTrigger asChild>
        {value ? (
          <>
            <span className={`whitespace-nowrap ${className}`}>
              {(value / 1000000000).toFixed(1)}{" "}
              <span className="text-primary text-sm">GB</span>
            </span>
          </>
        ) : (
          <span className="text-slate-500 text-sm">None</span>
        )}
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
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return (
    <Tooltip
      open={tooltipOpen}
      onOpenChange={(state) => {
        if (value) setTooltipOpen(state);
      }}
    >
      <TooltipTrigger asChild>
        {value ? (
          <>
            <span className={`whitespace-nowrap ${className}`}>
              {(value / 1000000000000).toFixed(2)}{" "}
              <span className="text-primary text-sm">TFLOPS</span>
            </span>
          </>
        ) : (
          <span className="text-slate-500 text-sm">None</span>
        )}
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
  const [displayCrippledDialog, setDisplayCrippleDialog] = useState(false);
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
  const [sorting, setSorting] = useState([
    {
      id: "fp16",
      desc: true,
    },
  ]);
  const debouncedSet = debounce(setColumnFilters, 250);

  useEffect(() => {
    // Get user settings
    const settings = localStorage.getItem(GPULocalStorageName);
    if (settings) {
      const settingsObj: SettingsObj = JSON.parse(settings);
      setFactorInCripple(settingsObj.crippled);
    }
  }, []);

  useEffect(() => {
    // Re-trigger sorting
    setSorting([...sorting]);
  }, [factorInCripple]);

  const columns = useMemo<ColumnDef<GPUData>[]>(
    () => [
      {
        accessorKey: "name",
        cell: (info) => (
          <span className="font-semibold">{info.getValue() as string}</span>
        ),
        header: () => <span>{accessorToFullNameMapping.name}</span>,
      },
      {
        accessorKey: "tdp",
        cell: (info) => (
          <span className="whitespace-nowrap">
            <span>{info.getValue() as string}</span>{" "}
            <span className="text-primary text-sm">W</span>
          </span>
        ),
        header: () => (
          <span className="whitespace-nowrap">
            {accessorToFullNameMapping.tdp}
          </span>
        ),
      },
      {
        accessorKey: "sms",
        cell: (info) => info.getValue(),
        header: () => <span>{accessorToFullNameMapping.sms}</span>,
      },
      {
        accessorKey: "vram",
        cell: (info) => <GBDisplay value={info.getValue() as number} />,
        header: () => <span>{accessorToFullNameMapping.vram}</span>,
      },
      {
        accessorKey: "membw",
        cell: (info) => <GBDisplay value={info.getValue() as number} />,
        header: () => <span>{accessorToFullNameMapping.membw}</span>,
      },
      {
        accessorKey: "cores_cuda",
        cell: (info) => info.getValue(),
        header: () => <span>{accessorToFullNameMapping.cores_cuda}</span>,
      },
      {
        accessorKey: "cores_tensor",
        cell: (info) => info.getValue(),
        header: () => <span>{accessorToFullNameMapping.cores_tensor}</span>,
      },
      {
        accessorKey: "register_size",
        cell: (info) => <KBDisplay value={info.getValue() as number} />,
        header: () => <span>{accessorToFullNameMapping.register_size}</span>,
      },
      {
        accessorKey: "cache_l1",
        cell: (info) =>
          info.getValue() !== null ? (
            <KBDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>{accessorToFullNameMapping.cache_l1}</span>,
      },
      {
        accessorKey: "cache_l2",
        cell: (info) =>
          info.getValue() !== null ? (
            <KBDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>{accessorToFullNameMapping.cache_l2}</span>,
      },
      {
        accessorKey: "fp32_general",
        cell: (info) => <TFlopsDisplay value={info.getValue() as number} />,
        header: () => <span>{accessorToFullNameMapping.fp32_general}</span>,
      },
      {
        id: "fp16",
        accessorFn: (row) => {
          return {
            value: row.fp16,
            crippledVal: row.fp16_ignore_crippled,
          };
        },
        sortingFn: (rowA, rowB) => {
          let dataA = rowA.original.fp16;
          let dataB = rowB.original.fp16;
          if (!factorInCripple) {
            dataA = rowA.original.fp16_ignore_crippled;
            dataB = rowB.original.fp16_ignore_crippled;
          }
          return dataA > dataB ? 1 : dataA < dataB ? -1 : 0;
        },
        cell: (info) => {
          const fp16Vals = info.getValue() as CrippledNonCrippledProps;
          return (
            <TFlopsDisplay
              value={factorInCripple ? fp16Vals.value : fp16Vals.crippledVal}
            />
          );
        },
        header: () => <span>{accessorToFullNameMapping.fp16}</span>,
      },
      {
        accessorKey: "bf16",
        accessorFn: (row) => {
          return {
            value: row.bf16,
            crippledVal: row.bf16_ignore_crippled,
          };
        },
        sortingFn: (rowA, rowB) => {
          let dataA = rowA.original.bf16;
          let dataB = rowB.original.bf16;
          if (!factorInCripple) {
            dataA = rowA.original.bf16_ignore_crippled;
            dataB = rowB.original.bf16_ignore_crippled;
          }

          if (!dataA) return -1;
          if (!dataB) return 1;
          return dataA > dataB ? 1 : dataA < dataB ? -1 : 0;
        },
        cell: (info) => {
          const vals = info.getValue() as CrippledNonCrippledProps;
          return info.getValue() !== null ? (
            <TFlopsDisplay
              value={factorInCripple ? vals.value : vals.crippledVal}
            />
          ) : (
            <NAText />
          );
        },
        header: () => <span>{accessorToFullNameMapping.bf16}</span>,
      },
      {
        accessorKey: "tf32",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>{accessorToFullNameMapping.tf32}</span>,
      },
      {
        accessorKey: "int8",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>{accessorToFullNameMapping.int8}</span>,
      },
      {
        accessorKey: "int4",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>{accessorToFullNameMapping.int4}</span>,
      },
      {
        accessorKey: "fp8",
        accessorFn: (row) => {
          return {
            value: row.fp8,
            crippledVal: row.fp8_ignore_crippled,
          };
        },
        sortingFn: (rowA, rowB) => {
          let dataA = rowA.original.fp8;
          let dataB = rowB.original.fp8;
          if (!factorInCripple) {
            dataA = rowA.original.fp8_ignore_crippled;
            dataB = rowB.original.fp8_ignore_crippled;
          }

          if (!dataA) return -1;
          if (!dataB) return 1;
          return dataA > dataB ? 1 : dataA < dataB ? -1 : 0;
        },
        cell: (info) => {
          const vals = info.getValue() as CrippledNonCrippledProps;
          info.getValue() !== null ? (
            <TFlopsDisplay
              value={factorInCripple ? vals.value : vals.crippledVal}
            />
          ) : (
            <NAText />
          );
        },
        header: () => <span>{accessorToFullNameMapping.fp8}</span>,
      },
      {
        accessorKey: "fp6",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>{accessorToFullNameMapping.fp6}</span>,
      },
      {
        accessorKey: "fp4",
        cell: (info) =>
          info.getValue() !== null ? (
            <TFlopsDisplay value={info.getValue() as number} />
          ) : (
            <NAText />
          ),
        header: () => <span>{accessorToFullNameMapping.fp4}</span>,
      },
      {
        accessorKey: "crippled_fp32acc",
        cell: (info) =>
          info.getValue() ? (
            <Badge variant="destructive">Crippled</Badge>
          ) : (
            <Badge variant={"success"}>Good</Badge>
          ),
        header: () => <span>{accessorToFullNameMapping.crippled_fp32acc}</span>,
      },
      {
        accessorKey: "citation",
        enableSorting: false,
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
        header: () => <span>{accessorToFullNameMapping.citation}</span>,
      },
    ],
    [factorInCripple],
  );

  const table = useReactTable({
    data: GPUDataJSON as GPUData[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // @ts-expect-error onColumnVisibilityChange has an incorrect type def
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
      sorting,
    },
    autoResetPageIndex: true,
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <div className="p-2 md:p-5 w-full h-max glassy-bg  lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl">
      <CrippledWarningDialog
        open={displayCrippledDialog}
        setOpen={setDisplayCrippleDialog}
      />
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
            if (factorInCripple) {
              setDisplayCrippleDialog(true);
            }
            // Save to localStorage
            localStorage.setItem(
              GPULocalStorageName,
              JSON.stringify({
                crippled: !factorInCripple,
              }),
            );
            setFactorInCripple(!factorInCripple);
          }}
          className="cursor-pointer transition-all sm:hover:opacity-50 flex items-center justify-center mt-3 md:mt-0 md:ml-4"
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
            if (
              !columnVisibility[
                colName as keyof typeof accessorToFullNameMapping
              ]
            ) {
              return (
                <Badge
                  key={colName}
                  onClick={() => {
                    columnVisibility[
                      colName as keyof typeof accessorToFullNameMapping
                    ] = true;
                    setColumnVisibility(
                      JSON.parse(stringifyVisibilityObj(columnVisibility)),
                    );
                  }}
                  className="ml-1 cursor-pointer animate-in fade-in"
                >
                  <span className="flex items-center">
                    {
                      accessorToFullNameMapping[
                        colName as keyof typeof accessorToFullNameMapping
                      ]
                    }{" "}
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
                    <div className="flex items-center justify-center">
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center justify-center text-center transition-opacity hover:opacity-50"
                            : "",
                          onClick: () => {
                            const setSort = [];
                            const sortState = header.column.getIsSorted();
                            if (sortState) {
                              if (sortState == "asc")
                                setSort.push({
                                  id: header.id,
                                  desc: true,
                                });
                            } else if (!sortState) {
                              setSort.push({
                                id: header.id,
                                desc: false,
                              });
                            }
                            setSorting(setSort);
                          },
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
                          columnVisibility[
                            header.id as keyof typeof accessorToFullNameMapping
                          ] = false;
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
                    <TableCell
                      className="text-[1.05rem] text-center items-center justify-center"
                      key={cell.id}
                    >
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
    </div>
  );
};
