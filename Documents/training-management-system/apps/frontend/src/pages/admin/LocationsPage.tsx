import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Location } from '@tms/shared';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AddEditLocationModal } from '@/components/admin/AddEditLocationModal';

export const LocationsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const queryClient = useQueryClient();
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [equipmentFilters, setEquipmentFilters] = useState<string[]>([]);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showEquipmentMenu, setShowEquipmentMenu] = useState(false);

  const toggleTypeFilter = (type: string) => {
    setTypeFilters(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleEquipmentFilter = (equipment: string) => {
    setEquipmentFilters(prev =>
      prev.includes(equipment) ? prev.filter(e => e !== equipment) : [...prev, equipment]
    );
  };

  const { data, isLoading } = useQuery({
    queryKey: ['locations', page, search],
    queryFn: () => locationsApi.getAll({ page }),
  });

  // Get all unique equipment from all locations
  const allEquipment = Array.from(new Set(
    data?.data.flatMap((location: Location) => location.equipment || [])
  )).sort();

  // Filter locations based on type and equipment
  const filteredLocations = data?.data.filter((location: Location) => {
    const matchesType = typeFilters.length === 0 || typeFilters.includes(location.type);
    const matchesEquipment = equipmentFilters.length === 0 || (
      location.equipment?.some(e => equipmentFilters.includes(e))
    );
    return matchesType && matchesEquipment;
  }) || [];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Conference Room': 'bg-info-100 text-info-700',
      'Auditorium': 'bg-purple-100 text-purple-700',
      'Training Room': 'bg-success-100 text-success-700',
      'Workshop Space': 'bg-pink-100 text-pink-700',
      'Meeting Room': 'bg-warning-100 text-warning-700',
      'Classroom': 'bg-amber-100 text-amber-700',
    };
    return colors[type] || 'bg-secondary-100 text-secondary-700';
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Locations</h1>
          </div>
         <Button 
  variant="primary" 
  className="bg-accent-500 hover:bg-accent-600"
  onClick={() => {
    setSelectedLocation(null);
    setIsModalOpen(true);
  }}
>
  + New Location
</Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-8 py-6">
        <div className="flex gap-3 items-center">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DropdownMenu.Root open={showTypeMenu} onOpenChange={setShowTypeMenu}>
            <DropdownMenu.Trigger asChild>
              <button className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                typeFilters.length > 0
                  ? 'border-accent-500 bg-accent-50 text-accent-700'
                  : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                </svg>
                {typeFilters.length > 0 ? `Type (${typeFilters.length})` : 'Type'}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[180px] bg-white rounded-lg shadow-lg border border-secondary-200 p-1" sideOffset={5}>
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                  onSelect={(e) => {
                    e.preventDefault();
                    setTypeFilters([]);
                  }}
                >
                  Clear All
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-secondary-200 my-1" />
                {['physical', 'virtual'].map((type) => (
                  <DropdownMenu.CheckboxItem
                    key={type}
                    className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none flex items-center gap-2"
                    checked={typeFilters.includes(type)}
                    onCheckedChange={() => toggleTypeFilter(type)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="w-4 h-4 border border-secondary-300 rounded flex items-center justify-center">
                      {typeFilters.includes(type) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </DropdownMenu.CheckboxItem>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <DropdownMenu.Root open={showEquipmentMenu} onOpenChange={setShowEquipmentMenu}>
            <DropdownMenu.Trigger asChild>
              <button className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                equipmentFilters.length > 0
                  ? 'border-accent-500 bg-accent-50 text-accent-700'
                  : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx="17" cy="17" r="3" />
                  <circle cx="7" cy="7" r="3" />
                </svg>
                {equipmentFilters.length > 0 ? `Equipment (${equipmentFilters.length})` : 'Equipment'}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[180px] bg-white rounded-lg shadow-lg border border-secondary-200 p-1" sideOffset={5}>
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                  onSelect={(e) => {
                    e.preventDefault();
                    setEquipmentFilters([]);
                  }}
                >
                  Clear All
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-secondary-200 my-1" />
                {allEquipment.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-secondary-500 italic">
                    No equipment available
                  </div>
                ) : (
                  allEquipment.map((equipment) => (
                    <DropdownMenu.CheckboxItem
                      key={equipment}
                      className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none flex items-center gap-2"
                      checked={equipmentFilters.includes(equipment)}
                      onCheckedChange={() => toggleEquipmentFilter(equipment)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="w-4 h-4 border border-secondary-300 rounded flex items-center justify-center">
                        {equipmentFilters.includes(equipment) && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {equipment}
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
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredLocations.map((location: Location) => (
                  <tr 
                    key={location.id} 
                    className="hover:bg-secondary-50 transition-colors cursor-pointer"
                    onClick={() => {
                    setSelectedLocation(location);
                    setIsModalOpen(true);
                    }}
                    >
                    <td className="px-6 py-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="text-sm font-medium text-secondary-900">
                            {location.name}
                          </span>
                        </div>
                        <p className="text-sm text-secondary-500 ml-6">
                          {location.address || 'No description'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2 ml-6">
                          {location.equipment.slice(0, 3).map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded"
                            >
                              {item}
                            </span>
                          ))}
                          {location.equipment.length > 3 && (
                            <span className="inline-flex px-2 py-0.5 bg-secondary-100 text-secondary-600 text-xs font-medium rounded">
                              +{location.equipment.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        {location.address || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(location.type)}`}>
                        {location.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                        </svg>
                        {location.capacity} people
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        -
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddEditLocationModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        location={selectedLocation}
      />
    </div>
  );
};