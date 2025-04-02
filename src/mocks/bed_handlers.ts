import type { PostResult } from "@/net/bed";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post(`https://api.superbed.cn/upload`, () => {
    let mockRes: PostResult = {
      err: 0,
      msg: "",
      id: "00001",
      url: "https://pic2.zhimg.com/v2-eb875fa60fe4366b908801e18e34788d_b.webp",
      size: 1024,
      name: "miku.webp",
      ids: [],
      urls: [],
      sizes: [],
      names: [],
    };
    return HttpResponse.json(mockRes);
  }),
  http.post(`https://api.superbed.cn/delete`, () => {
    let mockRes = {
      err: 0,
      msg: "",
    };
    return HttpResponse.json(mockRes);
  }),
];
