import { $ } from '@wdio/globals';

// Native Android dialog opened by React Native's Alert.alert.
class AlertDialog {
  get title() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/(alertTitle|alert_title)")');
  }

  button(text: string) {
    return $(`android=new UiSelector().className("android.widget.Button").textMatches("(?i)${text}")`);
  }

  async choose(text: string) {
    await this.title.waitForDisplayed();
    await this.button(text).click();
  }
}

export default new AlertDialog();
