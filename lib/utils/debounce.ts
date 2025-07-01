/**
 * Debounce utility for optimizing input performance
 * Delays function execution until after a specified delay has passed since the last invocation
 */

export type DebouncedFunction<T extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
};

/**
 * Creates a debounced version of the provided function
 * @param func The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the function with cancel and flush methods
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFunction = (...args: Parameters<T>): void => {
    lastArgs = args;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  // Cancel the debounced function call
  debouncedFunction.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  // Immediately execute the function with the last arguments
  debouncedFunction.flush = (): void => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFunction as DebouncedFunction<T>;
}

/**
 * Default debounce delay for input fields (in milliseconds)
 * Optimized for URL state updates - balances responsiveness with performance
 */
export const DEFAULT_DEBOUNCE_DELAY = 300;

/**
 * Shorter debounce delay for more responsive inputs (in milliseconds)
 */
export const FAST_DEBOUNCE_DELAY = 150;

/**
 * Longer debounce delay for expensive operations (in milliseconds)
 */
export const SLOW_DEBOUNCE_DELAY = 500; 