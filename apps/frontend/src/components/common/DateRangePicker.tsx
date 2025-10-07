import { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { parseLocalDate, formatLocalDate } from '@/utils/dateUtils';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  value: { from?: string; to?: string };
  onChange: (range: { from?: string; to?: string }) => void;
  placeholder?: string;
}

export function DateRangePicker({ value, onChange, placeholder = 'Select date range' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedRange: DateRange | undefined = value.from || value.to
    ? {
        from: value.from ? parseLocalDate(value.from) : undefined,
        to: value.to ? parseLocalDate(value.to) : undefined,
      }
    : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      onChange({ from: undefined, to: undefined });
      return;
    }

    if (range.from && range.to) {
      // Both dates selected
      onChange({
        from: formatLocalDate(range.from),
        to: formatLocalDate(range.to),
      });
    } else if (range.from) {
      // Only start date selected
      onChange({
        from: formatLocalDate(range.from),
        to: undefined,
      });
    }
  };

  const displayText = selectedRange?.from && selectedRange?.to
    ? `${format(selectedRange.from, 'MMM d, yyyy')} - ${format(selectedRange.to, 'MMM d, yyyy')}`
    : selectedRange?.from
    ? `${format(selectedRange.from, 'MMM d, yyyy')} - ...`
    : placeholder;

  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="relative">
      <button
        ref={setButtonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-left focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className={selectedRange?.from ? 'text-gray-900' : 'text-gray-500'}>
          {displayText}
        </span>
      </button>

      {isOpen && buttonRef && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown - Fixed position */}
          <div
            className="fixed z-20 bg-white border border-gray-200 rounded-lg shadow-xl p-4"
            style={(() => {
              const buttonRect = buttonRef.getBoundingClientRect();
              const dropdownHeight = 500; // Approximate height of the calendar
              const spaceBelow = window.innerHeight - buttonRect.bottom;
              const spaceAbove = buttonRect.top;

              // Position above if not enough space below
              const shouldPositionAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

              return {
                [shouldPositionAbove ? 'bottom' : 'top']: shouldPositionAbove
                  ? `${window.innerHeight - buttonRect.top + 8}px`
                  : `${buttonRect.bottom + 8}px`,
                left: `${buttonRect.left}px`,
              };
            })()}
          >
            <style>{`
              .date-range-calendar .rdp {
                --rdp-accent-color: #0d9488;
                --rdp-background-color: #ccfbf1;
                margin: 0;
              }
              .date-range-calendar .rdp-months {
                display: flex;
                gap: 1rem;
              }
            `}</style>
            <div className="date-range-calendar">
              <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={handleSelect}
                numberOfMonths={2}
                defaultMonth={selectedRange?.from ? new Date(selectedRange.from) : new Date()}
                disabled={{ before: new Date('2000-01-01') }}
              />
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  onChange({ from: undefined, to: undefined });
                  setIsOpen(false);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm px-4 py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
