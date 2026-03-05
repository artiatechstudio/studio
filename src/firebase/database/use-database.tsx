'use client';

import { useState, useEffect } from 'react';
import { onValue, off, DatabaseReference, DataSnapshot } from 'firebase/database';

export interface UseDatabaseResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to listen to a Firebase Realtime Database path.
 * Requires a memoized reference to avoid infinite loops.
 */
export function useDatabase<T = any>(
  dbRef: (DatabaseReference & { __memo?: boolean }) | null | undefined
): UseDatabaseResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!dbRef);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!dbRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Do not set loading to true if we already have data to avoid flickers, 
    // but the error stack indicates it's being called repeatedly.
    setIsLoading(true);

    const onDataChange = (snapshot: DataSnapshot) => {
      setData(snapshot.val() as T);
      setIsLoading(false);
      setError(null);
    };

    const onError = (err: Error) => {
      console.error("RTDB Error:", err);
      setError(err);
      setIsLoading(false);
    };

    onValue(dbRef, onDataChange, onError);

    return () => {
      off(dbRef, 'value', onDataChange);
    };
  }, [dbRef]);

  if (dbRef && !dbRef.__memo) {
    throw new Error('DatabaseReference was not properly memoized using useMemoFirebase');
  }

  return { data, isLoading, error };
}
