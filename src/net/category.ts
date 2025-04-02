import { serverApi } from "./http";
import type { CategoryItem } from "./models";

const error: CategoryItem[] = [
  {
    id: "",
    name: "error",
    meme_count: 0,
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

export async function updateCategory(
  memeId: string,
  list: string[]
): Promise<void> {
  const resp = await serverApi.put(`categories/${memeId}`, list);
  if (resp.status !== 200) {
    console.error("update category failed");
  }
}
