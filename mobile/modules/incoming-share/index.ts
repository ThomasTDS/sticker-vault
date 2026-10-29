import { type EventSubscription, NativeModule, requireNativeModule } from 'expo';

type IncomingShareEvents = {
  onShareReceived: (event: { uri: string }) => void;
};

declare class IncomingShareNativeModule extends NativeModule<IncomingShareEvents> {
  takeInitialSharedFile(): string | null;
}

const IncomingShare = requireNativeModule<IncomingShareNativeModule>('IncomingShare');

export const takeInitialSharedFile = () => IncomingShare.takeInitialSharedFile();

export const addShareListener = (listener: (uri: string) => void): EventSubscription =>
  IncomingShare.addListener('onShareReceived', ({ uri }) => listener(uri));
