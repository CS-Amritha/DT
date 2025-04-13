
import React from 'react';
import { TimeRange } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'last_5m', label: 'Last 5 minutes' },
    { value: 'last_10m', label: 'Last 10 minutes' },
    { value: 'last_15m', label: 'Last 15 minutes' },
    { value: 'last_30m', label: 'Last 30 minutes' },
    { value: 'last_1h', label: 'Last 1 hour' },
    { value: 'last_3h', label: 'Last 3 hours' },
    { value: 'last_6h', label: 'Last 6 hours' },
    { value: 'last_1d', label: 'Last 1 day' },
  ];

  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as TimeRange)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        {timeRanges.map((range) => (
          <SelectItem key={range.value} value={range.value}>
            {range.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimeRangeSelector;
