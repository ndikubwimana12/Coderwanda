import { useCallback, useEffect, useState } from 'react';
import api from './api';
const EMPTY = [];
export default function useRemote(path, initial = EMPTY) {
  const [state, setState] = useState({ path: null, data: initial, loading: true, error: '' });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    api.get(path, { signal: controller.signal }).then(({ data }) => {
      setState({ path, data, loading: false, error: '' });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ path, data: initial, loading: false, error: error.response?.data?.error || 'Unable to load this content. Please try again.' });
    });
    return () => controller.abort();
  }, [path, initial, version]);
  useEffect(() => {
    const onStorage = event => { if (event.key === 'coderwanda_content_version') reload(); };
    window.addEventListener('focus', reload);
    window.addEventListener('contentChanged', reload);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('focus', reload); window.removeEventListener('contentChanged', reload); window.removeEventListener('storage', onStorage); };
  }, [reload]);
  return { ...(state.path === path ? state : { data: initial, loading: true, error: '' }), reload };
}
