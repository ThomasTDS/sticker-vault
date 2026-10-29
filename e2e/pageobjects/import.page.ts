import BasePage from './base.page.ts';

class ImportPage extends BasePage {
  get errorMessage() {
    return this.byTestId('import-error-message');
  }

  get backButton() {
    return this.byTestId('import-back-button');
  }
}

export default new ImportPage();
