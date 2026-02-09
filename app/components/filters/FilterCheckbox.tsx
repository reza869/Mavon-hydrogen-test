import type {FilterValue} from '@shopify/hydrogen/storefront-api-types';

interface FilterCheckboxProps {
  value: FilterValue;
  checked: boolean;
  onChange: (filterInput: string, checked: boolean) => void;
}

export function FilterCheckbox({value, checked, onChange}: FilterCheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(value.input as string, e.target.checked);
  };

  return (
    <label className="filter-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="filter-checkbox__input
          w-[16px] h-[16px]
          m-0
          border border-[#ccc]
          rounded-[3px]
          cursor-pointer
          shrink-0
          bg-white
          relative
          focus:outline-none
        "
      />
      <span className="filter-checkbox__label py-[0.4rem] flex flex-grow relative text-[1.5rem] break-words leading-normal text-[rgba(var(--color-foreground),1)] cursor-pointer">
        {value.label}
        <span className="filter-checkbox__count">({value.count})</span>
      </span>
    </label>
  );
}
