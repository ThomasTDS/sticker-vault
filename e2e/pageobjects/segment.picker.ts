import BasePage from './base.page.ts';

// Same step as the app's segment sliders.
const SLIDER_STEP_MS = 100;

// Dialog that asks which part of a video or GIF longer than 10 s becomes the sticker.
class SegmentPicker extends BasePage {
  get container() {
    return this.byTestId('segment-picker');
  }

  get range() {
    return this.byTestId('segment-range');
  }

  get startValue() {
    return this.byTestId('segment-start-value');
  }

  get lengthValue() {
    return this.byTestId('segment-length-value');
  }

  get startSlider() {
    return this.byTestId('segment-start-slider');
  }

  get lengthSlider() {
    return this.byTestId('segment-length-slider');
  }

  get confirmButton() {
    return this.byTestId('segment-confirm-button');
  }

  get skipButton() {
    return this.byTestId('segment-skip-button');
  }

  // The slider is an Android SeekBar whose progress counts slider steps (100 ms each), not milliseconds.
  async setStart(ms: number) {
    await this.startSlider.setValue(String(ms / SLIDER_STEP_MS));
  }

  async waitForDialog() {
    await this.container.waitForDisplayed({ timeout: 30000 });
  }
}

export default new SegmentPicker();
