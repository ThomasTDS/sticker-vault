import { $ } from '@wdio/globals';
import BasePage from './base.page.ts';

// "Responder figurinha": received stickers and the reply suggestions for the chosen one.
class ReplyPage extends BasePage {
  get accessScreen() {
    return this.byTestId('reply-access');
  }

  get grantButton() {
    return this.byTestId('reply-grant-button');
  }

  get receivedHint() {
    return this.byTestId('reply-hint');
  }

  get receivedStickers() {
    return this.allByTestIdPattern('reply-received-[0-9]+');
  }

  receivedSticker(index: number) {
    return this.byTestId(`reply-received-${index}`);
  }

  get targetEmojis() {
    return this.byTestId('reply-target-emojis');
  }

  get noEmojisMessage() {
    return this.byTestId('reply-no-emojis');
  }

  get replyEmojis() {
    return this.byTestId('reply-reply-emojis');
  }

  get suggestions() {
    return this.allByTestIdPattern('reply-suggestion-[0-9]+');
  }

  suggestion(index: number) {
    return this.byTestId(`reply-suggestion-${index}`);
  }

  get emptySuggestions() {
    return this.byTestId('reply-suggestions-empty');
  }

  get changeEmojiButton() {
    return this.byTestId('reply-change-emoji');
  }

  emojiOption(emoji: string) {
    return $(
      `android=new UiSelector().resourceIdMatches("reply-emoji-option-[0-9]+").childSelector(new UiSelector().text("${emoji}"))`,
    );
  }
}

export default new ReplyPage();
