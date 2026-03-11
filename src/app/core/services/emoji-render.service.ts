import { Injectable } from '@angular/core';
import twemoji from 'twemoji';

@Injectable({
  providedIn: 'root',
})
export class EmojiRenderService {
  private readonly twemojiLocalBase = 'assets/twemoji/64';
  private readonly emojiSvgOverrides: Record<string, string> = {
    '2708-fe0f': '1f6eb',
  };

  toSvgUrl(emoji: string): string {
    const codepoints = twemoji.convert.toCodePoint(emoji);

    if (!codepoints) {
      return '';
    }

    const normalizedCodepoints = this.emojiSvgOverrides[codepoints] ?? codepoints;
    return `${this.twemojiLocalBase}/${normalizedCodepoints}.png`;
  }
}
