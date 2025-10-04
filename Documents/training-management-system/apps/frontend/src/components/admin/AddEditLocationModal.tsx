import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

interface AddEditLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: any;
}

const AVAILABLE_MATERIALS = [
  'Projector',
  'Whiteboard',
  'Flip Chart',
  'Sound System',
  'Microphone',
  'Video Conferencing',
  'Laptops',
  'Tablets',
  'WiFi',
  'Natural Light',
];

const LOCATION_TYPES = [
  'Conference Room',
  'Auditorium',
  'Training Room',
  'Workshop Space',
  'Meeting Room',
  'Classroom',
];

const OFFICE_LOCATIONS = [
  'Main Office - Downtown',
  'Corporate Headquarters',
  'Training Center',
  'North Campus',
  'East Wing',
  'West Building',
];

export const AddEditLocationModal: React.FC<AddEditLocationModalProps> = ({
  open,
  onOpenChange,
  location,
}) => {
  const [locationName, setLocationName] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [type, setType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  useEffect(() => {
    if (location) {
      setLocationName(location.name || '');
      setOfficeLocation(location.address || '');
      setType(location.type || '');
      setCapacity(location.capacity?.toString() || '');
      setEmail('');
      setDescription('');
      setStatus('Active');
      setSelectedMaterials(location.equipment || []);
    } else {
      setLocationName('');
      setOfficeLocation('');
      setType('');
      setCapacity('');
      setEmail('');
      setDescription('');
      setStatus('Active');
      setSelectedMaterials([]);
    }
  }, [location, open]);

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      locationName,
      officeLocation,
      type,
      capacity: parseInt(capacity),
      email,
      description,
      status,
      materials: selectedMaterials,
    });
    onOpenChange(false);
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
                  {location ? 'Edit Location' : 'New Location'}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-secondary-600">
                  {location 
                    ? 'Update location information and settings.' 
                    : 'Add a new location to the training management system.'}
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
              <div className="space-y-5">
                <Input
                  label="Location Name"
                  placeholder="e.g., Conference Room A"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Office Location <span className="text-error-500">*</span>
                  </label>
                  <select
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select location</option>
                    {OFFICE_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Type <span className="text-error-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    {LOCATION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Capacity"
                    type="number"
                    placeholder="Number of people"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="room@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Available Materials
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_MATERIALS.map((material) => (
                      <label
                        key={material}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMaterials.includes(material)}
                          onChange={() => toggleMaterial(material)}
                          className="w-4 h-4 text-accent-500 border-secondary-300 rounded focus:ring-accent-500"
                        />
                        <span className="text-sm text-secondary-700 group-hover:text-secondary-900">
                          {material}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description of the location..."
                    rows={4}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-secondary-200 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-accent-500 hover:bg-accent-600">
                {location ? 'Save Changes' : 'Create'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};