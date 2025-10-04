import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { User, UserRole } from '@tms/shared';
import { AddEditUserModal } from '@/components/admin/AddEditUserModal';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilters, setRoleFilters] = useState<UserRole[]>([]);
  const [skillFilters, setSkillFilters] = useState<string[]>([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSkillMenu, setShowSkillMenu] = useState(false);

  const toggleRoleFilter = (role: UserRole) => {
    setRoleFilters(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleSkillFilter = (skill: string) => {
    setSkillFilters(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.getAll({ page }),
  });

  // Get all unique skills from facilitators
  const allSkills = Array.from(new Set(
    data?.data
      .filter((user: User) => user.role === 'FACILITATOR' && user.facilitatorProfile)
      .flatMap((user: User) => user.facilitatorProfile?.qualifications || [])
  )).sort() || [];

  // Filter users based on role and skills
  const filteredUsers = data?.data.filter((user: User) => {
    const matchesRole = roleFilters.length === 0 || roleFilters.includes(user.role);
    const matchesSkill = skillFilters.length === 0 || (
      user.facilitatorProfile?.qualifications?.some(q => skillFilters.includes(q))
    );
    return matchesRole && matchesSkill;
  }) || [];

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Users</h1>
          </div>
          <Button 
  variant="primary" 
  className="bg-accent-500 hover:bg-accent-600"
  onClick={() => {
    setSelectedUser(null);
    setIsModalOpen(true);
  }}
>
  + New User
</Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-8 py-6">
        <div className="flex gap-3 items-center">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DropdownMenu.Root open={showRoleMenu} onOpenChange={setShowRoleMenu}>
            <DropdownMenu.Trigger asChild>
              <button className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                roleFilters.length > 0
                  ? 'border-accent-500 bg-accent-50 text-accent-700'
                  : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                </svg>
                {roleFilters.length > 0 ? `Role (${roleFilters.length})` : 'Role'}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[180px] bg-white rounded-lg shadow-lg border border-secondary-200 p-1" sideOffset={5}>
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                  onSelect={(e) => {
                    e.preventDefault();
                    setRoleFilters([]);
                  }}
                >
                  Clear All
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-secondary-200 my-1" />
                {(['ADMIN', 'COORDINATOR', 'HR', 'FACILITATOR'] as UserRole[]).map((role) => (
                  <DropdownMenu.CheckboxItem
                    key={role}
                    className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none flex items-center gap-2"
                    checked={roleFilters.includes(role)}
                    onCheckedChange={() => toggleRoleFilter(role)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="w-4 h-4 border border-secondary-300 rounded flex items-center justify-center">
                      {roleFilters.includes(role) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {role}
                  </DropdownMenu.CheckboxItem>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <DropdownMenu.Root open={showSkillMenu} onOpenChange={setShowSkillMenu}>
            <DropdownMenu.Trigger asChild>
              <button className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                skillFilters.length > 0
                  ? 'border-accent-500 bg-accent-50 text-accent-700'
                  : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                {skillFilters.length > 0 ? `Skills (${skillFilters.length})` : 'Skills'}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[180px] bg-white rounded-lg shadow-lg border border-secondary-200 p-1" sideOffset={5}>
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                  onSelect={(e) => {
                    e.preventDefault();
                    setSkillFilters([]);
                  }}
                >
                  Clear All
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-secondary-200 my-1" />
                {allSkills.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-secondary-500 italic">
                    No skills available
                  </div>
                ) : (
                  allSkills.map((skill) => (
                    <DropdownMenu.CheckboxItem
                      key={skill}
                      className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none flex items-center gap-2"
                      checked={skillFilters.includes(skill)}
                      onCheckedChange={() => toggleSkillFilter(skill)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="w-4 h-4 border border-secondary-300 rounded flex items-center justify-center">
                        {skillFilters.includes(skill) && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {skill}
                    </DropdownMenu.CheckboxItem>
                  ))
                )}
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
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredUsers.map((user: User) => (
                  <tr 
  key={user.id} 
  className="hover:bg-secondary-50 transition-colors cursor-pointer"
  onClick={() => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }}
>
                    <td className="px-6 py-5">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-secondary-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN' ? 'bg-error-100 text-error-700' :
                        user.role === 'FACILITATOR' ? 'bg-warning-100 text-warning-700' :
                        'bg-info-100 text-info-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-secondary-900">-</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-secondary-600">-</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddEditUserModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        user={selectedUser}
      />
    </div>
  );
};