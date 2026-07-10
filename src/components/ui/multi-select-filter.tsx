import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface MultiSelectFilterProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  className?: string;
}

export function MultiSelectFilter({
  title,
  options,
  selectedValues,
  onValuesChange,
  className = "w-full"
}: MultiSelectFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`justify-between font-normal text-left px-3 ${className}`}>
          {selectedValues.length > 0 ? (
            <span className="truncate flex gap-1 items-center">
              <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                {selectedValues.length}
              </span>
              seleccionados
            </span>
          ) : (
            <span className="text-muted-foreground">{title}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto" align="start">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selectedValues.includes(option)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={(checked) => {
              if (checked) {
                onValuesChange([...selectedValues, option]);
              } else {
                onValuesChange(selectedValues.filter((v) => v !== option));
              }
            }}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
        {selectedValues.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              onSelect={(e) => {
                e.preventDefault();
                onValuesChange([]);
              }}
              className="justify-center text-red-600 font-medium cursor-pointer"
            >
              Limpiar
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
