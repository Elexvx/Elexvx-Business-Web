'use client';
import { Select } from 'radix-ui';

export const SiteSelect = ({
  label,
  value,
  onValueChange,
  allLabel,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  allLabel: string;
  options: string[];
}) => (
  <Select.Root value={value || '__all'} onValueChange={(next) => onValueChange(next === '__all' ? '' : next)}>
    <Select.Trigger className="ui-select-trigger" aria-label={label}>
      <Select.Value />
      <Select.Icon aria-hidden>⌄</Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="ui-select-content" position="popper" sideOffset={6} collisionPadding={16}>
        <Select.ScrollUpButton className="ui-select-scroll">⌃</Select.ScrollUpButton>
        <Select.Viewport>
          {[{ value: '__all', label: allLabel }, ...options.map((option) => ({ value: option, label: option }))].map(
            (option) => (
              <Select.Item className="ui-select-item" key={option.value} value={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator aria-hidden>✓</Select.ItemIndicator>
              </Select.Item>
            )
          )}
        </Select.Viewport>
        <Select.ScrollDownButton className="ui-select-scroll">⌄</Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);
