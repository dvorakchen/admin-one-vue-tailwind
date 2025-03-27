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
  return new Promise((resolve) => {
    const ext = getFileExtension(file.file.name).toUpperCase();
    if (["GIF", "WEBP"].some((e) => ext === e)) {
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
