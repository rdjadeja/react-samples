import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { utils, writeFile } from 'xlsx'; // Import xlsx functions
import './index.css'; // Ensure Tailwind styles are included

const EditableTable = ({ columns, rows, getRowId, onSave, onCancel }) => {
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData] = useState({});
  const [pageSize, setPageSize] = useState(10); // Set default page size to 10

  const handleRowDoubleClick = (params) => {
    const id = getRowId(params.row);
    setEditRowId(id);
    setEditData({ ...params.row });
  };

  const handleSaveClick = () => {
    onSave(editRowId, editData);
    setEditRowId(null);
    setEditData({});
  };

  const handleCancelClick = () => {
    onCancel();
    setEditRowId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(rows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Table Data');
    writeFile(workbook, 'table-data.xlsx');
  };

  const renderColumns = columns.map((col) => ({
    ...col,
    renderCell: (params) => {
      if (editRowId === getRowId(params.row)) {
        return col.renderEditCell ? col.renderEditCell(params) : (
          <input
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            value={editData[col.field] || ''}
            onChange={(e) => handleEditChange(col.field, e.target.value)}
          />
        );
      }
      return col.renderCell ? col.renderCell(params) : params.value;
    },
  }));

  renderColumns.push({
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    renderCell: (params) => {
      const isEditing = editRowId === getRowId(params.row);

      return isEditing ? (
        <div className="flex gap-2 items-center">
          <IconButton
            onClick={handleSaveClick}
            className="text-blue-500 hover:bg-blue-100"
          >
            <SaveIcon />
          </IconButton>
          <IconButton
            onClick={handleCancelClick}
            className="text-red-500 hover:bg-red-100"
          >
            <CancelIcon />
          </IconButton>
        </div>
      ) : null;
    },
  });

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="w-3/5 bg-white rounded-lg shadow-md p-4 overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto">
          <DataGrid
            rows={rows}
            columns={renderColumns}
            getRowId={getRowId}
            onRowDoubleClick={handleRowDoubleClick}
            pageSize={pageSize} // Set default page size to 10
            rowsPerPageOptions={[10, 20, 50]} // Page size options
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)} // Update state on page size change
            className="w-full"
          />
        </div>
        <div className="sticky bottom-0 bg-white p-4 flex justify-between items-center shadow-md">
          <Button
            onClick={exportToExcel}
            variant="contained"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Export to Excel
          </Button>
          <div className="flex">
            {/* Pagination component will be handled by DataGrid */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableTable;
