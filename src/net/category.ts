import { serverApi } from "./http";
import type { CategoryItem } from "./models";

const error = [
  {
    id: "",
    name: "error",
  },
];

let categoriesCache: CategoryItem[] | null = null;

export async function getAllCategories(): Promise<CategoryItem[]> {
  if (categoriesCache !== null) {
    return categoriesCache;
  }

  try {
    const resp = await serverApi.get("categories");
    if (resp.status !== 200) {
      console.error("get categories failed");
      return error;
    }

    const list: CategoryItem[] = JSON.parse(resp.data);
    categoriesCache = list;
    return list;
  } catch (e) {
    console.error(e);
    return error;
  }
}

export function cleanCategories() {
  categoriesCache = null;
}
