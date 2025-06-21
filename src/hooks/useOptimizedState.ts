
import { useState, useCallback, useMemo, useRef } from 'react';

interface UseOptimizedStateOptions<T> {
  defaultValue: T;
  validator?: (value: T) => boolean;
  transformer?: (value: T) => T;
  equalityFn?: (a: T, b: T) => boolean;
}

export function useOptimizedState<T>({
  defaultValue,
  validator,
  transformer,
  equalityFn = (a, b) => a === b
}: UseOptimizedStateOptions<T>) {
  const [state, setState] = useState<T>(defaultValue);
  const previousValueRef = useRef<T>(defaultValue);

  // Setter otimizado com validação e transformação
  const setOptimizedState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(current => {
      const computedValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(current) 
        : newValue;

      // Aplicar transformação se fornecida
      const transformedValue = transformer ? transformer(computedValue) : computedValue;

      // Validar se fornecido
      if (validator && !validator(transformedValue)) {
        console.warn('Value failed validation, keeping current state');
        return current;
      }

      // Verificar igualdade para evitar re-renders desnecessários
      if (equalityFn(transformedValue, current)) {
        return current;
      }

      previousValueRef.current = current;
      return transformedValue;
    });
  }, [validator, transformer, equalityFn]);

  // Reset para valor padrão
  const reset = useCallback(() => {
    setOptimizedState(defaultValue);
  }, [defaultValue, setOptimizedState]);

  // Reverter para valor anterior
  const revert = useCallback(() => {
    setOptimizedState(previousValueRef.current);
  }, [setOptimizedState]);

  // Verificar se mudou do valor padrão
  const hasChanged = useMemo(() => {
    return !equalityFn(state, defaultValue);
  }, [state, defaultValue, equalityFn]);

  return {
    value: state,
    setValue: setOptimizedState,
    reset,
    revert,
    hasChanged,
    previousValue: previousValueRef.current
  };
}
