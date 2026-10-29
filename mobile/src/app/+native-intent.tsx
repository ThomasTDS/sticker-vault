import { setIncomingFileUri } from '@/stickers/incoming-file';

// Files opened with "Open with" arrive as content:// (or file://) URLs; they are sent to the import screen
// instead of being treated as app routes.
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (path.startsWith('content://') || path.startsWith('file://')) {
      setIncomingFileUri(path);
      return '/importar';
    }
    return path;
  } catch {
    return '/';
  }
}
