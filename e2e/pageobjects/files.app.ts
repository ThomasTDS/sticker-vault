import { browser } from '@wdio/globals';
import DocumentPicker from './document.picker.ts';

const FILES_APP = 'com.google.android.documentsui/com.android.documentsui.LauncherActivity';

// Android's Files app (DocumentsUI). Tapping a file there sends a VIEW intent, the "Open with" flow.
class FilesApp {
  async openFile(name: string) {
    // stop: true closes the app first, so a search left from an earlier run does not interfere.
    await browser.execute('mobile: startActivity', { intent: FILES_APP, stop: true });
    await DocumentPicker.open(name);
  }
}

export default new FilesApp();
