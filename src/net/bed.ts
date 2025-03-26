export interface Bed {
  postImage(img: File | string, type: Type): Promise<PostResult>;
  /**
   * delete images from bed
   * @param urls image urls want to delete
   *
   * # Return
   * return whether successfull
   */
  deleteImagesFromUrl(urls: string[]): Promise<boolean>;
}

export enum Type {
  File,
  Base64,
}

export type PostResult = {
  err: number;
  msg: string;
  id: string;
  url: string;
  size: number;
  name: string;
  ids: string[];
  urls: string[];
  sizes: number[];
  names: string[];
};

import md5 from "md5";

const USER_ID = import.meta.env.VITE_BED_USER_ID ?? "";
const TOKEN = import.meta.env.VITE_BED_TOKEN ?? "";

export class SuperBed implements Bed {
  async postImage(img: File | string, type: Type): Promise<PostResult> {
    const ts = Date.now();
    const sign = md5(`${USER_ID}-${TOKEN}-${ts}`);

    const form = new FormData();
    form.append("id", USER_ID);
    form.append("ts", ts.toString());
    form.append("sign", sign);

    switch (type) {
      case Type.File:
        {
          form.append(`file`, img);
        }
        break;
      case Type.Base64:
        {
          form.append("base64", img);
        }
        break;
      default:
        throw `unknown type: ${type}`;
    }

    const resp = await fetch("https://api.superbed.cn/upload", {
      method: "POST",
      body: form,
    });

    const data: PostResult = await resp.json();
    return data;
  }

  async deleteImagesFromUrl(urls: string[]): Promise<boolean> {
    const data = {
      token: TOKEN,
      urls: urls,
    };

    const resp = await fetch("https://api.superbed.cn/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result: { err: number; msg: string } = await resp.json();

    return result.err === 0;
  }
}
