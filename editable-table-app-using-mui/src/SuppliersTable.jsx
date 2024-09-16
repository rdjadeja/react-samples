import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditableTable from './EditableTable';

const ODATA_BASE_URL = 'https://services.odata.org/v4/northwind/northwind.svc';

const SuppliersTable = () => {
  const [rows, setRows] = useState([]);

  // Fetch suppliers data from OData API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${ODATA_BASE_URL}/Suppliers`);
        setRows(response.data.value);
      } catch (error) {
        console.error("Error fetching suppliers data", error);
      }
    };

    fetchData();
  }, []);

  // Define columns for Suppliers entity
  const columns = [
    { field: 'SupplierID', headerName: 'ID', width: 70 },
    { field: 'CompanyName', headerName: 'Company Name', width: 200 },
    { field: 'ContactName', headerName: 'Contact Name', width: 200 },
    { field: 'City', headerName: 'City', width: 150 },
  ];

  // Handle Save operation
  const handleSave = async (id, updatedData) => {
    try {
      await axios.patch(`${ODATA_BASE_URL}/Suppliers(${id})`, updatedData, {
        headers: { 'Content-Type': 'application/json' },
      });
      setRows((prevRows) =>
        prevRows.map((row) => (row.SupplierID === id ? updatedData : row))
      );
    } catch (error) {
      console.error('Error updating supplier data', error);
    }
  };

  // Handle Cancel operation (no-op for now)
  const handleCancel = () => {
    // No action needed on cancel in this case
  };

  return (
    <EditableTable
      columns={columns}
      rows={rows}
      getRowId={(row) => row.SupplierID}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default SuppliersTable;
