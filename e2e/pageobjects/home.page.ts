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

  get emptyStateHint() {
    return this.byTestId('home-empty-hint');
  }

  get newPackButton() {
    return this.byTestId('home-new-pack-button');
  }

  get searchInput() {
    return this.byTestId('home-search-input');
  }

  get searchEmptyMessage() {
    return this.byTestId('home-search-empty');
  }

  get searchResults() {
    return this.allByTestIdPattern('home-search-result-\\d+');
  }

  searchResultPackAt(index: number) {
    return this.byTestId(`home-search-result-pack-${index}`);
  }

  async search(text: string) {
    await this.searchInput.setValue(text);
  }

  get favoritesSection() {
    return this.byTestId('home-favorites');
  }

  get favoriteItems() {
    return this.allByTestIdPattern('home-favorites-item-\\d+');
  }

  get mostUsedCounts() {
    return this.allByTestIdPattern('home-most-used-count-\\d+');
  }

  packNameAt(index: number) {
    return this.byTestId(`home-pack-name-${index}`);
  }

  packCountAt(index: number) {
    return this.byTestId(`home-pack-count-${index}`);
  }

  async findPackIndex(name: string) {
    const names = await this.allByTestIdPattern('home-pack-name-\\d+').map((element) => element.getText());
    const index = names.indexOf(name);
    if (index === -1) {
      throw new Error(`Pack "${name}" not found on the home screen`);
    }
    return index;
  }

  async waitForScreen() {
    await this.title.waitForDisplayed({ timeout: 30000 });
  }
}

export default new HomePage();
