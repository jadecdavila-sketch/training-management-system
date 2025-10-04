import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';

export const ProgramsPage = () => {
    const navigate = useNavigate();
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
        <div className="space-y-4">
          {/* Mock data - we'll connect to real API later */}
          {[
            {
              id: 1,
              name: 'New Employee Onboarding',
              description: 'Comprehensive orientation program covering company culture, policies, and essential skills for new hires across all departments.',
              cohorts: 12,
            },
            {
              id: 2,
              name: 'Leadership Development Program',
              description: 'Advanced training for managers and senior staff focusing on strategic thinking, team management, and organizational leadership skills.',
              cohorts: 8,
            },
            {
              id: 3,
              name: 'Safety & Compliance Training',
              description: 'Mandatory safety protocols, regulatory compliance, and workplace safety standards training for all employees.',
              cohorts: 6,
            },
            {
              id: 4,
              name: 'Technical Skills Certification',
              description: 'Industry-specific technical training and certification program for engineering and technical staff members.',
              cohorts: 4,
            },
            {
              id: 5,
              name: 'Customer Service Excellence',
              description: 'Customer-focused training program designed to enhance communication skills and service delivery across client-facing roles.',
              cohorts: 10,
            },
            {
              id: 6,
              name: 'Project Management Fundamentals',
              description: 'Essential project management methodologies, tools, and best practices for cross-functional team leaders and coordinators.',
              cohorts: 7,
            },
          ].sort((a, b) => a.name.localeCompare(b.name)).map((program) => (
            <div
              key={program.id}
              className="bg-white border border-secondary-200 rounded-xl p-6 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-6">
                {/* Cohort Count Circle */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full border border-primary-500 flex flex-col items-center justify-center">
                    <span className="text-base font-normal text-secondary-600">{program.cohorts}</span>
                  </div>
                  <p className="text-xs text-secondary-500 text-center mt-1">{program.cohorts} Cohorts</p>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {program.name}
                  </h3>
                  <p className="text-sm text-secondary-600 leading-relaxed">
                    {program.description}
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
                          onSelect={() => console.log('Edit', program.id)}
                        >
                          Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                          onSelect={() => console.log('Duplicate', program.id)}
                        >
                          Duplicate
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded cursor-pointer outline-none"
                          onSelect={() => console.log('Archive', program.id)}
                        >
                          Archive
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};