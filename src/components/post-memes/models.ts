export type FileGroup = {
  id: number;
  categories: string[];
  files: FileItem[];
};

export class FileItem {
  constructor(
    public id: number,
    public file: File,
    public _objectUrl: string | null
  ) {}

  public get objectUrl(): string {
    if (this._objectUrl === null) {
      this._objectUrl = URL.createObjectURL(this.file);
    }

    return this._objectUrl;
  }

  public set objectUrl(value: string) {
    this._objectUrl = value;
  }
}

const DEFAULT_CATEGOIES = ["meme"];

export function getDefaultCategories(): string[] {
  return DEFAULT_CATEGOIES.slice();
}
