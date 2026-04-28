'use client';

import { useState } from 'react';
import { HIGHLIGHT_COLORS, COLOR_GROUPS } from '@/lib/highlight-colors';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (_color: string) => void;
}

interface ColorSwatchProps {
  name: string;
  hex: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

interface FilterTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterTab({ label, active, onClick }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors ${active ? 'bg-white text-gray-900 border-t-2 border-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      type="button"
    >
      {label}
    </button>
  );
}

function ColorSwatch({ name, hex, description, isSelected, onClick }: ColorSwatchProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${isSelected ? 'ring-2 ring-gray-900 ring-offset-2 scale-105' : ''}`}
      style={{ backgroundColor: hex }}
      title={`${name} - ${description}`}
      type="button"
    >
      <div className="text-xs font-medium text-white drop-shadow-md">{name}</div>
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L8 12.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
}

export function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  const [activeGroup, setActiveGroup] = useState<'all' | 'primary' | 'secondary' | 'accent' | 'neutral'>('all');

  const filteredColors = activeGroup === 'all' ? HIGHLIGHT_COLORS : COLOR_GROUPS[activeGroup];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200">
        <FilterTab label="All" active={activeGroup === 'all'} onClick={() => setActiveGroup('all')} />
        <FilterTab label="Primary" active={activeGroup === 'primary'} onClick={() => setActiveGroup('primary')} />
        <FilterTab label="Secondary" active={activeGroup === 'secondary'} onClick={() => setActiveGroup('secondary')} />
        <FilterTab label="Accent" active={activeGroup === 'accent'} onClick={() => setActiveGroup('accent')} />
        <FilterTab label="Neutral" active={activeGroup === 'neutral'} onClick={() => setActiveGroup('neutral')} />
      </div>

      <div className="grid grid-cols-6 gap-3 p-4 bg-gray-50 rounded-lg">
        {filteredColors.map((color) => (
          <ColorSwatch
            key={color.name}
            name={color.name}
            hex={color.hex}
            description={color.description}
            isSelected={selectedColor.toLowerCase() === color.name.toLowerCase()}
            onClick={() => onColorSelect(color.name)}
          />
        ))}
      </div>

      {selectedColor && (
        <div className="text-sm text-gray-600">
          Selected: <span className="font-medium">{selectedColor}</span>
        </div>
      )}
    </div>
  );
}
