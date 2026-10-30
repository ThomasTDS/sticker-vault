// Holds the received sticker chosen on the reply screen until the suggestions screen reads it.
// Like incoming-file.ts, the URL is not passed as a route parameter: the folder permission is only valid
// for the exact URL, and route parameters are decoded.
let targetUri: string | null = null;

export function setReplyTarget(uri: string) {
  targetUri = uri;
}

export function getReplyTarget() {
  return targetUri;
}
