import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const LimitContext = createContext(null);
const requests = new Map();

const getDateKey = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const readLimit = (key) => {
  if (!key) return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(key));
    if (value && Number.isFinite(value.remaining) && (value.limit === null || Number.isFinite(value.limit))) {
      return { remaining: value.remaining, limit: value.limit };
    }
  } catch {
    return null;
  }
  return null;
};

const writeLimit = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
};

const fetchLimit = (key) => {
  if (!requests.has(key)) {
    const request = api.get('/ask/limit')
      .then(({ data }) => data)
      .finally(() => requests.delete(key));
    requests.set(key, request);
  }
  return requests.get(key);
};

export const LimitProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const dateKey = getDateKey();
  const storageKey = userId ? `askLimit:${userId}:${dateKey}` : null;
  const [quota, setQuota] = useState(() => readLimit(storageKey));
  const [isValidated, setIsValidated] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!storageKey) {
      setQuota(null);
      setIsValidated(false);
      setUnavailable(false);
      return undefined;
    }

    setQuota(readLimit(storageKey));
    setIsValidated(false);
    setUnavailable(false);
    let active = true;
    let retryCount = 0;
    let retryTimer;

    const loadLimit = async () => {
      try {
        const data = await fetchLimit(storageKey);
        if (!Number.isFinite(data?.remaining) || !Number.isFinite(data?.limit)) {
          throw new Error('Invalid ask limit response');
        }
        const next = { remaining: data.remaining, limit: data.limit };
        writeLimit(storageKey, next);
        if (!active) return;
        setQuota(next);
        setIsValidated(true);
        setUnavailable(false);
      } catch {
        if (!active) return;
        setIsValidated(false);
        setUnavailable(true);
        if (retryCount === 0) {
          retryCount += 1;
          retryTimer = setTimeout(loadLimit, 3000);
        }
      }
    };

    loadLimit();
    return () => {
      active = false;
      clearTimeout(retryTimer);
    };
  }, [storageKey]);

  const updateFromAskResponse = (response) => {
    if (!storageKey || !Number.isFinite(response?.remaining)) return;
    const next = { remaining: response.remaining, limit: quota?.limit ?? null };
    writeLimit(storageKey, next);
    setQuota(next);
    setIsValidated(true);
    setUnavailable(false);
  };

  return (
    <LimitContext.Provider value={{ quota, isValidated, unavailable, updateFromAskResponse }}>
      {children}
    </LimitContext.Provider>
  );
};

export const useLimit = () => {
  const context = useContext(LimitContext);
  if (!context) throw new Error('useLimit must be used within a LimitProvider');
  return context;
};
