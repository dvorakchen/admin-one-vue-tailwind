export interface Bed {
  postImage(img: File): Promise<PostResult>;
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
  async postImage(img: File): Promise<PostResult> {
    const ts = Date.now();
    const sign = md5(`${USER_ID}-${TOKEN}-${ts}`);

    const form = new FormData();
    form.append("id", USER_ID);
    form.append("ts", ts.toString());
    form.append("sign", sign);
    form.append(`file`, img);

    const resp = await fetch("https://api.superbed.cn/upload", {
      method: "POST",
      body: form,
    });

    const data: PostResult = await resp.json();
    return data;
  }
}
