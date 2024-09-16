import React from 'react';
import SuppliersTable from './SuppliersTable';
import OrdersTable from './OrdersTable';
import './index.css'; // Import Tailwind CSS

function App() {
  return (
    <div className="App">
      <OrdersTable />
    </div>
  );
}

export default App;