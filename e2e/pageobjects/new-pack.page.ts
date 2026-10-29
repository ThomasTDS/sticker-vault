import BasePage from './base.page.ts';

class NewPackPage extends BasePage {
  get nameInput() {
    return this.byTestId('new-pack-name-input');
  }

  get publisherInput() {
    return this.byTestId('new-pack-publisher-input');
  }

  get animatedSwitch() {
    return this.byTestId('new-pack-animated-switch');
  }

  get submitButton() {
    return this.byTestId('new-pack-submit-button');
  }

  get nameError() {
    return this.byTestId('new-pack-name-error');
  }

  get publisherError() {
    return this.byTestId('new-pack-publisher-error');
  }

  async fill(name: string, publisher: string) {
    await this.nameInput.setValue(name);
    await this.publisherInput.setValue(publisher);
  }

  async submit() {
    await this.submitButton.click();
  }
}

export default new NewPackPage();
