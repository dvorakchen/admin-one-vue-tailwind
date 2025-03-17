export type LoginRes = {
  username: string;
  email: string;
  jwt_token: string;
};

export type ChangePwdReq = {
  hashed_password_current: string;
  hashed_password_new: string;
};

export type Pagination<T> = {
  page: number;
  size: number;
  total: number;
  list: T[];
};

export type Meme = {
  id: string;
  likes: number;
  unlikes: number;
  categories: string[];
  nickname: string;
  show_date_time: string;
  list: MemeUrl[];
};

export type MemeUrl = {
  id: string;
  url: string;
  cover: string;
  format: string;
  sort: number;
};

export type CategoryItem = {
  id: string;
  name: string;
};

export type PostMemeGroup = {
  username: string;
  categories: string[];
  message: string;
  memes: PostMeme[];
};

export type PostMeme = {
  url: string;
  cover: string;
  format: string;
  hash: string;
  bed_id: string;
};
