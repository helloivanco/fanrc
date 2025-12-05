'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  filterActiveCount?: number;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search products...',
  onFilterClick,
  filterActiveCount = 0,
}: SearchBarProps) => {
  const handleClear = () => {
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onChange('');
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFilterClick?.();
    }
  };

  return (
    <div className='relative w-full'>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
        <svg
          className='h-5 w-5 text-gray-400 transition-colors'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          aria-hidden='true'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
      </div>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`block w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 ${
          onFilterClick ? 'pr-28 lg:pr-12' : 'pr-12'
        }`}
        aria-label='Search products'
      />
      <div className='absolute inset-y-0 right-0 flex items-center gap-2 pr-3'>
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            onKeyDown={handleFilterKeyDown}
            className='flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 lg:hidden'
            aria-label='Open filters'
            tabIndex={0}>
            <svg
              className='h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              aria-hidden='true'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
              />
            </svg>
            {filterActiveCount > 0 && (
              <span className='flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white'>
                {filterActiveCount}
              </span>
            )}
          </button>
        )}
        {value && (
          <button
            onClick={handleClear}
            className='flex items-center text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2'
            aria-label='Clear search'
            tabIndex={0}>
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
