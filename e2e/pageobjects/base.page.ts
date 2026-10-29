import { $, $$ } from '@wdio/globals';

export default abstract class BasePage {
  // On Android, the React Native testID is exposed as the element's resource-id.
  protected byTestId(testId: string) {
    return $(`android=new UiSelector().resourceId("${testId}")`);
  }

  protected allByTestIdPattern(pattern: string) {
    return $$(`android=new UiSelector().resourceIdMatches("${pattern}")`);
  }

  // Scrolls the screen to the end, so the last buttons sit above the Android gesture bar.
  async scrollToEnd() {
    await $('android=new UiScrollable(new UiSelector().scrollable(true)).scrollToEnd(5)').isExisting();
  }
}
