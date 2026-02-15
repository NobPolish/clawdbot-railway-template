/**
 * Performance Optimization Utilities
 * Provides tools for debouncing, throttling, memoization, and performance monitoring
 */

/**
 * Debounce Hook
 * Delays function execution until after a specified wait time
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle Hook
 * Limits function execution to once per specified interval
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastUpdated = React.useRef<number>(Date.now());

  React.useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timeout = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval);
      return () => clearTimeout(timeout);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Lazy Loading Component
 * Loads components only when needed
 */
import React from 'react';

export function useLazy<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): T | null {
  const [component, setComponent] = React.useState<T | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    importFunc().then(mod => {
      if (isMounted) {
        setComponent(() => mod.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [importFunc]);

  return component;
}

/**
 * Performance Monitor Hook
 * Tracks component render times
 */
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === componentName) {
          console.log(`[v0] ${componentName} render time: ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => {
      performance.measure(componentName, 'navigationStart');
      observer.disconnect();
    };
  }, [componentName]);
}

/**
 * Request Animation Frame Hook
 * Optimizes animations and frequent updates
 */
export function useAnimationFrame(callback: FrameRequestCallback) {
  const animationIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const animate = (time: DOMHighResTimeStamp) => {
      callback(time);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [callback]);
}

/**
 * Intersection Observer Hook
 * Lazy load elements when they become visible
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      observer.disconnect();
    };
  }, [elementRef, options]);

  return isVisible;
}

/**
 * Local Storage Hook with Sync
 * Persists state to localStorage with automatic synchronization
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('[v0] localStorage read error:', error);
      return initialValue;
    }
  });

  const setValue = React.useCallback((value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('[v0] localStorage write error:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * Memory Leak Prevention Hook
 * Automatically cleans up resources
 */
export function useCleanup(cleanup: () => void, deps?: React.DependencyList) {
  React.useEffect(() => {
    return cleanup;
  }, deps);
}

/**
 * Memoization Hook
 * Computes expensive values only when dependencies change
 */
export function useMemoCompute<T>(
  compute: () => T,
  deps: React.DependencyList,
  isEqual?: (a: T, b: T) => boolean
): T {
  const [value, setValue] = React.useState<T>(() => compute());
  const prevDepsRef = React.useRef<React.DependencyList>(deps);

  React.useEffect(() => {
    if (depsHaveChanged(prevDepsRef.current, deps)) {
      const newValue = compute();
      const shouldUpdate = !isEqual ? true : !isEqual(value, newValue);
      if (shouldUpdate) {
        setValue(newValue);
      }
      prevDepsRef.current = deps;
    }
  }, [deps, compute, isEqual, value]);

  return value;
}

function depsHaveChanged(prevDeps: React.DependencyList, currentDeps: React.DependencyList): boolean {
  if (prevDeps === currentDeps) return false;
  if (!prevDeps || !currentDeps || prevDeps.length !== currentDeps.length) return true;
  return prevDeps.some((dep, i) => dep !== currentDeps[i]);
}
