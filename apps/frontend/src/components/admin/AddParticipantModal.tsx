import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { participantsApi } from '@/services/api';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Participant } from '@tms/shared';

interface AddParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant?: Participant | null;
}

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  open,
  onOpenChange,
  participant,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState('active');

  // Populate form when editing
  useEffect(() => {
    if (participant) {
      setFirstName(participant.firstName || '');
      setLastName(participant.lastName || '');
      setEmail(participant.email);
      setJobTitle(participant.jobTitle || '');
      setDepartment(participant.department || '');
      setLocation(participant.location || '');
      setStartDate(participant.hireDate ? new Date(participant.hireDate).toISOString().split('T')[0] : '');
      setStatus(participant.status || 'active');
    } else {
      // Reset form for new participant
      setFirstName('');
      setLastName('');
      setEmail('');
      setJobTitle('');
      setDepartment('');
      setLocation('');
      setStartDate('');
      setStatus('active');
    }
  }, [participant, open]);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: participantsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to create participant');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => participantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update participant');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: participantsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to delete participant');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      firstName,
      lastName,
      email,
      jobTitle,
      department,
      location,
      hireDate: startDate ? new Date(startDate) : undefined,
      status,
    };

    if (participant) {
      updateMutation.mutate({ id: participant.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (participant && confirm('Are you sure you want to delete this participant?')) {
      deleteMutation.mutate(participant.id);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content 
          className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-secondary-200">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-2xl font-bold text-secondary-900">
                  {participant ? 'Edit Participant' : 'New Participant'}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-secondary-600">
                  {participant ? 'Update participant information or remove from system.' : 'Add a new participant to the training management system.'}
                </Dialog.Description>
              </div>
              <Dialog.Close className="text-secondary-400 hover:text-secondary-600 transition-colors">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
                Participant Information
              </h3>

              <div className="space-y-5">
                <Input
                  label="First Name"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />

                <Input
                  label="Last Name"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                    Job Title <span className="text-error-500">*</span>
                  </label>
                  <select
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select job title</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Designer">Designer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Sales Representative">Sales Representative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Department <span className="text-error-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Region <span className="text-error-500">*</span>
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select region</option>
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia Pacific">Asia Pacific</option>
                    <option value="Latin America">Latin America</option>
                    <option value="Global">Global</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Start Date <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-secondary-200 bg-white flex items-center justify-between gap-3">
              {participant ? (
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
                  {participant ? 'Save Changes' : 'Create'}
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};