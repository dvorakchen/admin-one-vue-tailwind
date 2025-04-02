import { http, HttpResponse } from "msw";
import { decrypt, encrypt } from "@/utils/cipher";
import type {
  CategoryItem,
  LoginRes,
  Meme,
  MemeUrl,
  Pagination,
  PostMemeGroup,
} from "@/net/models";

const BASE_URL = import.meta.env.VITE_NET_BASE_URL;

export const handlers = [
  http.post(`${BASE_URL}login`, () => {
    let mockRes: LoginRes = {
      username: "dvorak",
      email: "test@email.com",
      jwt_token: "",
    };
    return HttpResponse.text(encrypt(JSON.stringify(mockRes)));
  }),
  http.get(`${BASE_URL}check-logged-in`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.get(`${BASE_URL}categories`, () => {
    let mockRes: CategoryItem[] = [
      {
        id: "00",
        name: "meme",
        meme_count: 0,
      },
    ];
    return HttpResponse.text(encrypt(JSON.stringify(mockRes)));
  }),
  http.get(`${BASE_URL}memes`, ({ request }) => {
    const qs = new URLSearchParams(new URL(request.url).search);
    const page = parseInt(qs.get("page") ?? "1");
    const size = parseInt(qs.get("size") ?? "20");

    let mockRes: Pagination<Meme> = {
      page,
      size,
      total: Math.ceil(fakeMemes.length / 20),
      list: fakeMemes.slice((page - 1) * 10, size),
    };
    return HttpResponse.text(encrypt(JSON.stringify(mockRes)));
  }),
  http.post(`${BASE_URL}post-memes`, async ({ request }) => {
    const enText = await request.text();
    const plainText = decrypt(enText);
    const data = JSON.parse(plainText) as PostMemeGroup[];
    fakeMemes.unshift(
      ...data.map((item, i) => {
        return {
          id: `025${i}`,
          likes: 0,
          unlikes: 0,
          categories: ["meme"],
          nickname: item.username,
          show_date_time: "2025-01-03 12:23:00",
          list: item.memes.map((meme, i) => {
            return {
              id: `026${i}`,
              url: meme.url,
              cover: meme.cover,
              format: meme.format,
              sort: i,
            } as MemeUrl;
          }),
        } as Meme;
      })
    );
    return new HttpResponse(null, { status: 200 });
  }),
  http.put(`${BASE_URL}categories/:id`, ({ params }) => {
    const { id } = params;
    console.log("update category: ", id);

    return new HttpResponse(null, { status: 200 });
  }),
];

export const fakeMemes: Meme[] = [
  {
    id: "000",
    likes: 0,
    unlikes: 0,
    categories: ["meme", "猫"],
    nickname: "dvorak",
    show_date_time: "2025-01-03 12:23:00",
    list: [
      {
        id: "00",
        url: "https://puui.qpic.cn/media_img/0/1732551538010396/0",
        cover: "",
        format: "PNG",
        sort: 0,
      },
      {
        id: "01",
        url: "https://wallpaperm.cmcm.com/09108f0d7f193b31b010f4d0a01f4f34.jpg",
        cover: "",
        format: "JPG",
        sort: 0,
      },
    ],
  },
  {
    id: "000",
    likes: 0,
    unlikes: 0,
    categories: ["meme", "初音未来"],
    nickname: "dvorak",
    show_date_time: "2025-01-03 12:23:00",
    list: [
      {
        id: "01",
        url: "https://pic2.zhimg.com/v2-eb875fa60fe4366b908801e18e34788d_b.webp",
        cover:
          "https://tse1-mm.cn.bing.net/th/id/OIP-C.H5APl_ng2w6zIXiFHZhwyAAAAA?w=181&h=180",
        format: "WEBP",
        sort: 0,
      },
    ],
  },
].flatMap((item) => new Array(11).fill(item));
