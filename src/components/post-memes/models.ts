

const DEFAULT_CATEGOIES = ["meme"];

export class DefaultCategory {
  public static get value(): string[] {
    return DEFAULT_CATEGOIES.slice();
  }
}
