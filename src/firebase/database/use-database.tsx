
'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, off, DatabaseReference, DataSnapshot } from 'firebase/database';

export interface UseDatabaseResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to listen to a Firebase Realtime Database path.
 * @template T Type of the data.
 * @param {DatabaseReference | null | undefined} dbRef The RTDB reference.
 * @returns {UseDatabaseResult<T>} The data, loading state, and error.
 */
export function useDatabase<T = any>(
  dbRef: DatabaseReference | null | undefined
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

    setIsLoading(true);
    setError(null);

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

  return { data, isLoading, error };
}
