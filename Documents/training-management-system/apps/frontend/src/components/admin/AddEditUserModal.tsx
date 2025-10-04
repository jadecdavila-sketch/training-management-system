import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

interface AddEditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any; // Will be null for "Add", populated for "Edit"
}

const SKILLS = [
  'Leadership Development',
  'Safety Training',
  'Technical Skills',
  'Communication',
  'Compliance Training',
  'Process Improvement',
  'Team Building',
  'Customer Service',
  'Sales Training',
  'Project Management',
  'Diversity & Inclusion',
  'Onboarding',
  'Performance Management',
  'Change Management',
  'Time Management',
];

export const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('Active');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || '');
      setDepartment(''); // We'll add this to the User model later
      setStatus('Active');
      setSelectedSkills(user.facilitatorProfile?.qualifications || []);
    } else {
      setFullName('');
      setEmail('');
      setRole('');
      setDepartment('');
      setStatus('Active');
      setSelectedSkills([]);
    }
  }, [user, open]);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to delete user');
    },
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: any = {
      name: fullName,
      email,
      role,
    };

    // Add password for new users (required by backend)
    if (!user) {
      data.password = 'tempPassword123';
    }

    // Add facilitator profile if role is FACILITATOR and skills are selected
    if (role === 'FACILITATOR' && selectedSkills.length > 0) {
      data.facilitatorProfile = {
        qualifications: selectedSkills,
      };
    }

    if (user) {
      updateMutation.mutate({ id: user.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (user && confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(user.id);
    }
  };

  const getRolePermissions = () => {
    switch (role) {
      case 'ADMIN':
        return [
          'Full system access and settings',
          'User management and permissions',
          'System configuration',
        ];
      case 'COORDINATOR':
        return [
          'Create and manage programs',
          'Manage cohorts and schedules',
          'View reports',
        ];
      case 'HR':
        return [
          'Manage participants',
          'View training records',
          'Export reports',
        ];
      case 'FACILITATOR':
        return [
          'View assigned sessions',
          'Update session materials',
          'Mark attendance',
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-secondary-200">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-2xl font-bold text-secondary-900">
                  {user ? 'Edit User' : 'New User'}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-secondary-600">
                  {user ? 'Update user information and permissions.' : 'Add a new user to the system.'}
                </Dialog.Description>
              </div>
              <Dialog.Close className="text-secondary-400 hover:text-secondary-600 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Dialog.Close>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-6">
                User Information
              </h3>

              <div className="space-y-5">
                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Role <span className="text-error-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="COORDINATOR">Coordinator</option>
                    <option value="HR">HR</option>
                    <option value="FACILITATOR">Facilitator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Skills - Only show for Facilitators */}
                {role === 'FACILITATOR' && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      Skills & Expertise
                    </h3>
                    <p className="text-sm text-secondary-600 mb-4">
                      Select the skills this facilitator can teach:
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {SKILLS.map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill)}
                            onChange={() => toggleSkill(skill)}
                            className="w-4 h-4 text-accent-500 border-secondary-300 rounded focus:ring-accent-500"
                          />
                          <span className="text-sm text-secondary-700 group-hover:text-secondary-900">
                            {skill}
                          </span>
                        </label>
                      ))}
                    </div>

                    {selectedSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-2">
                          Selected skills ({selectedSkills.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-accent-100 text-accent-700 text-xs font-medium rounded-full"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className="hover:text-accent-900"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Role Permissions */}
                {role && (
                  <div className="mt-8 pt-6 border-t border-secondary-200">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                      Role Permissions
                    </h3>
                    <p className="text-sm text-secondary-600 mb-3">
                      This role will have access to:
                    </p>
                    <ul className="space-y-2">
                      {getRolePermissions().map((permission, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-secondary-700">
                          <svg className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <circle cx="10" cy="10" r="10" />
                            <path fill="white" d="M8 13l-3-3 1-1 2 2 4-4 1 1-5 5z" />
                          </svg>
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-secondary-200 bg-white flex items-center justify-between gap-3">
              {user ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending || updateMutation.isPending}
                >
                  Delete
                </Button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-accent-500 hover:bg-accent-600"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {user ? 'Save Changes' : 'Create'}
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};