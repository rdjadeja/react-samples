import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditableTable from './EditableTable';

const ODATA_BASE_URL = 'https://services.odata.org/v4/northwind/northwind.svc';

const OrdersTable = () => {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Fetch orders, customers, and employees data from OData API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, customersResponse, employeesResponse] = await Promise.all([
          axios.get(`${ODATA_BASE_URL}/Orders`),
          axios.get(`${ODATA_BASE_URL}/Customers`),
          axios.get(`${ODATA_BASE_URL}/Employees`),
        ]);

        setRows(ordersResponse.data.value);
        setCustomers(customersResponse.data.value);
        setEmployees(employeesResponse.data.value);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  // Create mappings for customer and employee names
  const customerMap = customers.reduce((map, customer) => {
    map[customer.CustomerID] = customer.CompanyName;
    return map;
  }, {});

  const employeeMap = employees.reduce((map, employee) => {
    map[employee.EmployeeID] = `${employee.FirstName} ${employee.LastName}`;
    return map;
  }, {});

  // Define columns for Orders entity
  const columns = [
    { field: 'OrderID', headerName: 'Order ID', width: 100 },
    {
      field: 'CustomerID',
      headerName: 'Customer Name',
      width: 200,
      editable: true,
      renderCell: (params) => customerMap[params.value] || params.value,
      renderEditCell: (params) => (
        <select
          value={params.value || ''}
          onChange={(e) => params.api.setEditCellValue({ id: params.id, field: 'CustomerID', value: e.target.value })}
          style={{ width: '100%' }}
        >
          {customers.map((customer) => (
            <option key={customer.CustomerID} value={customer.CustomerID}>
              {customer.CompanyName}
            </option>
          ))}
        </select>
      ),
    },
    {
      field: 'EmployeeID',
      headerName: 'Employee Name',
      width: 200,
      editable: true,
      renderCell: (params) => employeeMap[params.value] || params.value,
      renderEditCell: (params) => (
        <select
          value={params.value || ''}
          onChange={(e) => params.api.setEditCellValue({ id: params.id, field: 'EmployeeID', value: e.target.value })}
          style={{ width: '100%' }}
        >
          {employees.map((employee) => (
            <option key={employee.EmployeeID} value={employee.EmployeeID}>
              {employee.FirstName} {employee.LastName}
            </option>
          ))}
        </select>
      ),
    },
    { field: 'OrderDate', headerName: 'Order Date', width: 200 },
    { field: 'ShipCity', headerName: 'Ship City', width: 150 },
  ];

  // Handle Save operation
  const handleSave = async (id, updatedData) => {
    try {
      await axios.patch(`${ODATA_BASE_URL}/Orders(${id})`, updatedData, {
        headers: { 'Content-Type': 'application/json' },
      });
      setRows((prevRows) =>
        prevRows.map((row) => (row.OrderID === id ? updatedData : row))
      );
    } catch (error) {
      console.error('Error updating order data', error);
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
      getRowId={(row) => row.OrderID}
      onSave={handleSave}
      onCancel={handleCancel}
      customerMap={customerMap}
      employeeMap={employeeMap}
    />
  );
};

export default OrdersTable;
