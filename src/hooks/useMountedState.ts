import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * A hook that provides state management that's safe for components that might unmount
 * before async operations complete.
 */
export function useMountedState<T extends object>(initialState: T): [T, (nextState: Partial<T>) => void] {
  const [state, setState] = useState<T>(initialState);
  const isMountedRef = useRef(true);
  
  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Safe state setter that only updates if component is still mounted
  const setMountedState = useCallback((nextState: Partial<T>) => {
    if (isMountedRef.current) {
      setState(prevState => ({ ...prevState, ...nextState }));
    }
  }, []);
  
  return [state, setMountedState];
}