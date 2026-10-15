import { useEffect, useRef } from 'react';

export function useOnChange(value: unknown, onChange: () => void) {
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current !== value) {
      previous.current = value;
      onChange();
    }
  });
}
