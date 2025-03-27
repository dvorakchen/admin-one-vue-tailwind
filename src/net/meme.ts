import { getFileExtension } from "@/utils/file";
import type { PostMeme, PostMemeGroup } from "./models";
import { SuperBed, Type, type Bed } from "./bed";
import { blake3 } from "@noble/hashes/blake3";
import aesjs from "aes-js";
import { serverApi } from "./http";

export async function postMemes(
  fileGroups: FileGroup[],
  can: HTMLCanvasElement
): Promise<boolean> {
  const bed: Bed = new SuperBed();

  const waitGroups = fileGroups.map((group) => {
    const waitGroup = {
      categories: group.categories,
      message: "",
      waitingMemes: group.files.map(async (file) => {
        const base64 = await generateCover(file, can);
        return await postImg2Bed(bed, file.file, base64);
      }),
      memes: [] as PostMeme[],
    };
    return waitGroup;
  });

  for (const group of waitGroups) {
    group.memes = await Promise.all(group.waitingMemes);
  }

  const groups = waitGroups.map((group) => {
    return {
      categories: group.categories,
      message: group.message,
      memes: group.memes,
      username: "dvorak", // default username
    } as PostMemeGroup;
  });

  const res = await serverApi.post("post-memes", groups);
  if (res.status === 200) {
    return true;
  } else {
    console.error("上传服务器失败");
    //  reverse bed
    const urls = groups
      .flatMap((g) => g.memes.flatMap((t) => [t.url, t.cover]))
      .filter((t) => t !== "");
    await bed.deleteImagesFromUrl(urls);
    return false;
  }
}

/**
 * generate a cover of animate image
 * @param file file item
 * @param can canvas
 * @returns cover that base64 or empty
 */
function generateCover(
  file: FileItem,
  can: HTMLCanvasElement
): Promise<string> {
  return new Promise(async (resolve) => {
    const res = await isAnimate(file);
    if (res) {
      const img = new Image();
      img.onload = () => {
        can.width = img.width;
        can.height = img.height;

        const ctx = can.getContext("2d");
        ctx!.drawImage(img, 0, 0);
        const coverBase64 = can.toDataURL("image/png");

        resolve(coverBase64);
      };
      img.src = file.objectUrl;
    } else {
      resolve("");
    }
  });
}

async function isAnimate(file: FileItem): Promise<boolean> {
  const ext = getFileExtension(file.file.name).toUpperCase();

  switch (ext) {
    case "GIF":
      return true;
    case "WEBP":
      return await isAnimateWEBP(file);
    default:
      return false;
  }
}

async function isAnimateWEBP(file: FileItem): Promise<boolean> {
  const buf = await file.file.arrayBuffer();
  const view = new DataView(buf);

  if (view.getUint32(0) !== 0x52494646) return false; // 'RIFF'
  if (view.getUint32(8) !== 0x57454250) return false; // 'WEBP'

  if (view.getUint32(12) === 0x56503858) {
    // 'VP8X'
    const flags = view.getUint8(16);
    // check animate bit
    return !!(flags & 0x02);
  }

  return false;
}

async function postImg2Bed(
  bed: Bed,
  file: File,
  coverBase64?: string
): Promise<PostMeme> {
  const res = await bed.postImage(file, Type.File);
  if (res.err !== 0) {
    throw res.msg;
  }

  let cover = "";
  if (coverBase64 !== undefined && coverBase64 !== "") {
    const coverRes = await bed.postImage(coverBase64, Type.Base64);
    if (coverRes.err !== 0) {
      await bed.deleteImagesFromUrl([res.url]);
      throw coverRes.msg;
    }
    cover = coverRes.url;
  }

  let bytes = new Uint8Array(await file.arrayBuffer());
  const hash = aesjs.utils.hex.fromBytes(blake3(bytes));

  const p = {
    url: res.url,
    cover,
    format: getFileExtension(res.name).toUpperCase(),
    hash,
    bed_id: res.id,
  } as PostMeme;
  return p;
}

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
