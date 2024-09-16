import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { EditableTable, InputType } from './components/EditableTable';

type Candidate = {
  ID: string;
  name: string;
  email: string;
  jobApplication: string;
};

type JobApplication = {
  ID: string;
  trackingID: string;
  appliedOn: string;
};

const CandidateTable: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const fetchCandidates = useCallback(async () => {
    try {
      let url = '/api/odata/v4/recruiter/Candidates';

      // Apply sorting
      if (sorting.length > 0) {
        const orderBy = sorting.map(sort => `${sort.id} ${sort.desc ? 'desc' : 'asc'}`).join(',');
        url += `?$orderby=${orderBy}`;
      }

      // Apply filtering
      if (columnFilters.length > 0) {
        const filterParam = columnFilters
          .map(filter => `${filter.id} eq '${filter.value}'`)
          .join(' and ');
        url += sorting.length > 0 ? `&$filter=${filterParam}` : `?$filter=${filterParam}`;
      }

      const response = await axios.get(url);
      setCandidates(response.data.value);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  }, [sorting, columnFilters]);

  const fetchJobApplications = async () => {
    try {
      const response = await axios.get('/api/odata/v4/recruiter/Jobs');
      setJobApplications(response.data.value);
    } catch (error) {
      console.error('Error fetching job applications:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobApplications();
  }, [fetchCandidates]);

  const columns: ColumnDef<Candidate>[] = [
    {
      accessorKey: 'ID',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
      inputType: 'text' as InputType,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      inputType: 'email' as InputType,
    },
    {
      accessorKey: 'jobApplication',
      header: 'Job ID',
      cell: (info) => info.getValue(),
      inputType: 'select' as InputType,
      options: jobApplications.map((ja) => ({
        value: ja.trackingID,
        label: `${ja.trackingID}`,
      })),
    },
  ];

  const handleAdd = async () => {
    const newCandidate: Candidate = {
      ID: '',
      name: '',
      email: '',
      jobApplication: '',
    };
    try {
      const response = await axios.post('/api/odata/v4/recruiter/Candidates', newCandidate);
      setCandidates([response.data, ...candidates]);
    } catch (error) {
      console.error('Error adding new candidate:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/odata/v4/recruiter/Candidates/${id}`);
      setCandidates(candidates.filter((candidate) => candidate.ID !== id));
    } catch (error) {
      console.error('Error deleting candidate:', error);
    }
  };

  const handleUpdate = async (rowIndex: number, columnId: string, value: any) => {
    const updatedCandidate = { ...candidates[rowIndex], [columnId]: value };
    try {
      await axios.put(`/api/odata/v4/recruiter/Candidates/${updatedCandidate.ID}`, updatedCandidate);
      setCandidates(candidates.map((candidate, index) =>
        index === rowIndex ? updatedCandidate : candidate
      ));
    } catch (error) {
      console.error('Error updating candidate:', error);
    }
  };

  const handleExport = () => {
    // Implement Excel export functionality here
    console.log('Exporting to Excel...');
  };

  const handleSort = (newSorting: SortingState) => {
    setSorting(newSorting);
  };

  const handleFilter = (newColumnFilters: ColumnFiltersState) => {
    setColumnFilters(newColumnFilters);
  };

  return (
    <div className="container mx-auto p-4">
      <EditableTable<Candidate>
        data={candidates}
        columns={columns}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onExport={handleExport}
        getRowId={(row) => row.ID}
        onSort={handleSort}
        onFilter={handleFilter}
      />
    </div>
  );
};

export default CandidateTable;