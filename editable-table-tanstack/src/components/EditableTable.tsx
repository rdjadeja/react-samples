import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import DatePicker from 'react-datepicker';

import Select from 'react-select';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon, PlusIcon, ArrowDownTrayIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import 'react-datepicker/dist/react-datepicker.css';

type InputType = 'text' | 'number' | 'date' | 'email' | 'select' | 'radio';

interface EditableCellProps<T> {
  getValue: () => any;
  row: { index: number; original: T };
  column: { id: string };
  table: {
    options: {
      meta?: {
        updateData: (rowIndex: number, columnId: string, value: any) => void;
      };
    };
  };
  inputType: InputType;
  options?: { value: string; label: string }[];
  isEditing: boolean;
}

function EditableCell<T>({
  getValue,
  row: { index, original },
  column: { id },
  table,
  inputType,
  options,
  isEditing,
}: EditableCellProps<T>) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    table.options.meta?.updateData(index, id, value);
  };

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (!isEditing) {
    return <span className="px-2 py-1">{value as string}</span>;
  }

  switch (inputType) {
    case 'text':
    case 'email':
      return (
        <input
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          type={inputType}
          className="w-full px-2 py-1 border rounded"
        />
      );
    case 'number':
      return (
        <input
          value={value as number}
          onChange={(e) => setValue(Number(e.target.value))}
          onBlur={onBlur}
          type="number"
          className="w-full px-2 py-1 border rounded"
        />
      );
    case 'date':
      return (
        <DatePicker
          selected={value ? new Date(value as string) : null}
          onChange={(date: Date) => {
            setValue(date.toISOString());
            table.options.meta?.updateData(index, id, date.toISOString());
          }}
          dateFormat="yyyy-MM-dd"
          className="w-full px-2 py-1 border rounded"
        />
      );
    case 'select':
      return (
        <Select
          value={options?.find((option) => option.value === value)}
          onChange={(newValue) => {
            setValue(newValue?.value);
            table.options.meta?.updateData(index, id, newValue?.value);
          }}
          options={options}
          className="w-full"
        />
      );
    case 'radio':
      return (
       <input type="radio" 
       value={value}
       onChange={(e) => setValue((e.target.value))}
       onBlur={onBlur}
       className="w-full px-2 py-1 border rounded">
       </input>
      );
    default:
      return <span className="px-2 py-1">{value as string}</span>;
  }
}

interface EditableTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  onUpdate: (rowIndex: number, columnId: string, value: any) => void;
  onAdd: () => void;
  onDelete: (id: string | number) => void;
  onExport: () => void;
  getRowId: (row: T) => string | number;
  onSortingChange: (sorting: SortingState) => void;
  onFilterChange: (columnFilters: ColumnFiltersState) => void;
}

function EditableTable<T extends object>({
  data,
  columns,
  onUpdate,
  onAdd,
  onDelete,
  onExport,
  getRowId,
  onSortingChange,
  onFilterChange,
}: EditableTableProps<T>) {
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handleEdit = (id: string | number) => {
    setEditingId(id);
  };

  const handleSave = (id: string | number) => {
    // Implement save logic here
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const actionColumn: ColumnDef<T> = {
    id: 'actions',
    header: 'Actions',
    cell: (info) => (
      <div className="flex space-x-2">
        {editingId === getRowId(info.row.original) ? (
          <>
            <button
              onClick={() => handleSave(getRowId(info.row.original))}
              className="p-1 text-green-600 hover:text-green-800"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleCancel()}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleEdit(getRowId(info.row.original))}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(getRowId(info.row.original))}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    ),
  };

  const table = useReactTable({
    data,
    columns: [...columns, actionColumn],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (newSorting) => {
      setSorting(newSorting);
      onSortingChange(newSorting);
    },
    onColumnFiltersChange: (newFilters) => {
      setColumnFilters(newFilters);
      onFilterChange(newFilters);
    },
    state: {
      sorting,
      columnFilters,
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) =>
        onUpdate(rowIndex, columnId, value),
    },
  });

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-6">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-end space-x-4 items-center">
          {/* <button
            onClick={onAdd}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition ease-in-out duration-150 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Record</span>
          </button> */}
          <button
            onClick={onExport}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition ease-in-out duration-150 flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Export to Excel</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-200 text-sm text-gray-700">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-3 text-left font-semibold border-b border-gray-300">
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center space-x-2">
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <ChevronUpIcon className="w-4 h-4 inline-block ml-1" />,
                              desc: <ChevronDownIcon className="w-4 h-4 inline-block ml-1" />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                          {header.column.getCanFilter() && (
                            <input
                              type="text"
                              onChange={(e) => header.column.setFilterValue(e.target.value)}
                              value={(header.column.getFilterValue() ?? '') as string}
                              className="w-28 p-1 text-sm border border-gray-300 rounded focus:ring focus:ring-blue-200 focus:outline-none"
                              placeholder="Filter..."
                            />
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 text-gray-800">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 border-b border-gray-300">
                      {cell.column.id === 'actions'
                        ? flexRender(cell.column.columnDef.cell, cell.getContext())
                        : (
                          <EditableCell
                            {...cell.getContext()}
                            inputType={(cell.column.columnDef as any).inputType || 'text'}
                            options={(cell.column.columnDef as any).options}
                            isEditing={editingId === getRowId(row.original)}
                          />
                        )
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export { EditableTable, EditableCell };
export type { InputType, EditableTableProps };