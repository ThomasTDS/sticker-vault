// Holds the URL of a file opened with "Open with" until the import screen reads it.
// The URL is kept exactly as Android delivered it: the read permission granted to the app is only valid
// for that exact URL, and passing it as a route parameter would decode it (raw%3A... becomes raw:...).
let pendingUri: string | null = null;

export function setIncomingFileUri(uri: string) {
  pendingUri = uri;
}

export function takeIncomingFileUri() {
  const uri = pendingUri;
  pendingUri = null;
  return uri;
}
