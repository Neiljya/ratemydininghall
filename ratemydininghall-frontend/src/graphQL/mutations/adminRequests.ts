// src/graphQL/mutations/adminRequests.ts
import { graphQLRequest } from "@graphQL/graphQLClient";
import {
  CREATE_DINING_HALL,
  CREATE_MENU_ITEMS_BATCH,
  CREATE_MENU_ITEM,
  UPDATE_DINING_HALL,
  DELETE_DINING_HALL,
  // ADD THESE (make sure they exist in adminMutations.ts)
  UPDATE_MENU_ITEM,
  DELETE_MENU_ITEM,
} from "./adminMutations";

export type CreateDiningHallInput = {
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
};

export type MacrosInput = {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
};

export type CreateMenuItemInput = {
  diningHallSlug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  macros?: MacrosInput | null;
};

export type UpdateDiningHallInput = {
  id: string;
  name?: string;
  slug?: string;
  imageUrl?: string | null;
  description?: string | null;
};

export async function createDiningHall(input: CreateDiningHallInput) {
  return graphQLRequest(CREATE_DINING_HALL, { input });
}

export async function createMenuItemsBatch(diningHallSlug: string, items: CreateMenuItemInput[]) {
  return graphQLRequest(CREATE_MENU_ITEMS_BATCH, {
    input: { diningHallSlug, items },
  });
}

export async function createMenuItemsIndividually(items: CreateMenuItemInput[]) {
  await Promise.all(items.map((input) => graphQLRequest(CREATE_MENU_ITEM, { input })));
}

export async function updateDiningHall(input: UpdateDiningHallInput) {
  return graphQLRequest(UPDATE_DINING_HALL, { input });
}

export async function deleteDiningHall(id: string) {
  return graphQLRequest(DELETE_DINING_HALL, { id });
}

export type UpdateMenuItemInput = {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  macros?: MacrosInput | null;
};

export async function updateMenuItem(id: string, input: UpdateMenuItemInput) {
  return graphQLRequest(UPDATE_MENU_ITEM, { id, input });
}

export async function deleteMenuItem(id: string) {
  return graphQLRequest(DELETE_MENU_ITEM, { id });
}
