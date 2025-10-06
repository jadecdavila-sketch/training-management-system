import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programsApi } from '@/services/api';

export const ProgramsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['programs'],
    queryFn: () => programsApi.getAll({ page: 1, pageSize: 100 }),
  });

  const archiveMutation = useMutation({
    mutationFn: programsApi.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
    onError: (error: any) => {
      alert(`Failed to archive program: ${error.message}`);
    },
  });

  const handleArchive = (programId: string, programName: string) => {
    if (confirm(`Archive "${programName}"? This will move it to the bottom of the list.`)) {
      archiveMutation.mutate(programId);
    }
  };
  return (
    <div className="flex-1">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Program Types</h1>
          </div>
          <button 
            onClick={() => navigate('/admin/programs/new')}
            className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-colors"
            >
            + New Program Type
            </button>
        </div>
      </div>

      {/* Program Cards */}
      <div className="px-8 py-8">
        {isLoading && (
          <div className="text-center py-8 text-secondary-600">Loading programs...</div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600">Failed to load programs</div>
        )}

        {data && data.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary-600 mb-4">No programs created yet</p>
            <button
              onClick={() => navigate('/admin/programs/new')}
              className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-colors"
            >
              Create Your First Program
            </button>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="space-y-4">
            {data.data
              .sort((a: any, b: any) => {
                // Sort: non-archived first (alphabetically), then archived last (alphabetically)
                if (a.archived === b.archived) {
                  return a.name.localeCompare(b.name);
                }
                return a.archived ? 1 : -1;
              })
              .map((program: any) => (
            <div
              key={program.id}
              className={`bg-white border rounded-xl p-6 hover:shadow-md transition-all cursor-pointer ${
                program.archived
                  ? 'border-secondary-300 opacity-60'
                  : 'border-secondary-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-start gap-6">
                {/* Cohort Count Circle */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full border border-primary-500 flex flex-col items-center justify-center">
                    <span className="text-base font-normal text-secondary-600">
                      {program.cohorts?.length || 0}
                    </span>
                  </div>
                  <p className="text-xs text-secondary-500 text-center mt-1">
                    {program.cohorts?.length || 0} Cohorts
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {program.name}
                    </h3>
                    {program.archived && (
                      <span className="px-2 py-0.5 text-xs font-medium text-secondary-600 bg-secondary-100 rounded">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-secondary-600 leading-relaxed mb-2">
                    {program.description}
                  </p>
                  <p className="text-xs text-secondary-500">
                    Created {new Date(program.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Actions Menu */}
                <div className="flex-shrink-0">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="min-w-[160px] bg-white rounded-lg shadow-lg border border-secondary-200 p-1" sideOffset={5}>
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                          onSelect={() => navigate(`/admin/programs/edit/${program.id}`)}
                        >
                          Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                          onSelect={() => console.log('Duplicate', program.id)}
                        >
                          Duplicate
                        </DropdownMenu.Item>
                        {!program.archived && (
                          <DropdownMenu.Item
                            className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                            onSelect={() => handleArchive(program.id, program.name)}
                          >
                            Archive
                          </DropdownMenu.Item>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};