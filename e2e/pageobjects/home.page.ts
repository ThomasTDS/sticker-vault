import BasePage from './base.page.ts';

class HomePage extends BasePage {
  get title() {
    return this.byTestId('home-title');
  }

  get subtitle() {
    return this.byTestId('home-subtitle');
  }

  get emptyState() {
    return this.byTestId('home-empty-state');
  }

  get emptyStateMessage() {
    return this.byTestId('home-empty-message');
  }

  async waitForScreen() {
    await this.title.waitForDisplayed({ timeout: 30000 });
  }
}

export default new HomePage();
