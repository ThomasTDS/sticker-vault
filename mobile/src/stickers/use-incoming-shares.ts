import { router } from 'expo-router';
import { useEffect } from 'react';

import { addShareListener, takeInitialSharedFile } from '../../modules/incoming-share';
import { setIncomingFileUri } from '@/stickers/incoming-file';

// Sends files received through Android's "Share" menu to the import screen,
// both when the share launches the app and when the app is already open.
export function useIncomingShares() {
  useEffect(() => {
    const openImport = (uri: string) => {
      setIncomingFileUri(uri);
      router.push('/importar');
    };

    const initial = takeInitialSharedFile();
    if (initial) {
      openImport(initial);
    }
    const subscription = addShareListener(openImport);
    return () => subscription.remove();
  }, []);
}
