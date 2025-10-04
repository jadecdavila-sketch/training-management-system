import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { participantsApi } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { AddParticipantModal } from '@/components/admin/AddParticipantModal';
import { Participant } from '@tms/shared';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const ParticipantsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [departmentFilters, setDepartmentFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [showDepartmentMenu, setShowDepartmentMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const queryClient = useQueryClient();

  const toggleDepartmentFilter = (dept: string) => {
    setDepartmentFilters(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const { data, isLoading } = useQuery({
    queryKey: ['participants', page, search],
    queryFn: () => participantsApi.getAll({ page, search }),
  });

  // Filter participants based on department and status
  const filteredParticipants = data?.data.filter((participant: Participant) => {
    const matchesDepartment = departmentFilters.length === 0 || departmentFilters.includes(participant.department || '');
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(participant.status);
    return matchesDepartment && matchesStatus;
  }) || [];

  const deleteMutation = useMutation({
    mutationFn: participantsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this participant?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Participants</h1>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-accent-500 hover:bg-accent-600"
          >
            + New Participant
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-8 py-6">
        <div className="flex gap-3 items-center">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <DropdownMenu.Root open={showDepartmentMenu} onOpenChange={setShowDepartmentMenu}>
            <DropdownMenu.Trigger asChild>
              <button className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                departmentFilters.length > 0
                  ? 'border-accent-500 bg-accent-50 text-accent-700'
                  : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                {departmentFilters.length > 0 ? `Department (${departmentFilters.length})` : 'Department'}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[180px] bg-white rounded-lg shadow-lg border border-secondary-200 p-1" sideOffset={5}>
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                  onSelect={(e) => {
                    e.preventDefault();
                    setDepartmentFilters([]);
                  }}
                >
                  Clear All
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-secondary-200 my-1" />
                {['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR'].map((dept) => (
                  <DropdownMenu.CheckboxItem
                    key={dept}
                    className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none flex items-center gap-2"
                    checked={departmentFilters.includes(dept)}
                    onCheckedChange={() => toggleDepartmentFilter(dept)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="w-4 h-4 border border-secondary-300 rounded flex items-center justify-center">
                      {departmentFilters.includes(dept) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {dept}
                  </DropdownMenu.CheckboxItem>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <DropdownMenu.Root open={showStatusMenu} onOpenChange={setShowStatusMenu}>
            <DropdownMenu.Trigger asChild>
              <button className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                statusFilters.length > 0
                  ? 'border-accent-500 bg-accent-50 text-accent-700'
                  : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {statusFilters.length > 0 ? `Status (${statusFilters.length})` : 'Status'}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[180px] bg-white rounded-lg shadow-lg border border-secondary-200 p-1" sideOffset={5}>
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                  onSelect={(e) => {
                    e.preventDefault();
                    setStatusFilters([]);
                  }}
                >
                  Clear All
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-secondary-200 my-1" />
                {['Active', 'Inactive', 'On Leave'].map((status) => (
                  <DropdownMenu.CheckboxItem
                    key={status}
                    className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none flex items-center gap-2"
                    checked={statusFilters.includes(status)}
                    onCheckedChange={() => toggleStatusFilter(status)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="w-4 h-4 border border-secondary-300 rounded flex items-center justify-center">
                      {statusFilters.includes(status) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {status}
                  </DropdownMenu.CheckboxItem>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Table */}
      <div className="px-8">
        {isLoading ? (
          <div className="text-center py-12 text-secondary-600">Loading...</div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      Join Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {filteredParticipants.map((participant: Participant) => (
                    <tr
                      key={participant.id}
                      className="hover:bg-secondary-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedParticipant(participant)}
                    >
                      <td className="px-6 py-5">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">
                            {participant.firstName} {participant.lastName}
                          </div>
                          <div className="text-sm text-secondary-500">{participant.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-secondary-900">{participant.jobTitle || '-'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-secondary-900">{participant.department || '-'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700">
                          {participant.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-secondary-600">
                          {participant.hireDate 
                            ? new Date(participant.hireDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })
                            : '-'
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-secondary-600">
                  Showing {(page - 1) * data.pagination.pageSize + 1} to{' '}
                  {Math.min(page * data.pagination.pageSize, data.pagination.total)} of{' '}
                  {data.pagination.total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === data.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddParticipantModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      <AddParticipantModal
        open={!!selectedParticipant}
        onOpenChange={(open) => !open && setSelectedParticipant(null)}
        participant={selectedParticipant}
      />
    </div>
  );
};