import { $ } from '@wdio/globals';

export default abstract class BasePage {
  // On Android, the React Native testID is exposed as the element's resource-id.
  protected byTestId(testId: string) {
    return $(`android=new UiSelector().resourceId("${testId}")`);
  }
}
