// src/graphQL/mutations/adminRequests.ts
import { graphQLRequest } from "@graphQL/graphQLClient";
import {
  CREATE_DINING_HALL,
  CREATE_MENU_ITEMS_BATCH,
  CREATE_MENU_ITEM,
  UPDATE_DINING_HALL,
  DELETE_DINING_HALL,
  UPDATE_MENU_ITEM,
  DELETE_MENU_ITEM,
} from "./adminMutations";

export type CreateDiningHallInput = {
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  parentHallSlug?: string | null;
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
  price?: number | null;
  category?: string | null;
  tags?: string[] | null;
};

export type UpdateDiningHallInput = {
  id: string;
  name?: string;
  slug?: string;
  imageUrl?: string | null;
  description?: string | null;
  parentHallSlug?: string | null;
};

export async function createDiningHall(input: CreateDiningHallInput, token?: string | null) {
  return graphQLRequest(CREATE_DINING_HALL, { input }, token);
}

export async function createMenuItemsBatch(diningHallSlug: string, items: CreateMenuItemInput[], token?: string | null) {
  return graphQLRequest(CREATE_MENU_ITEMS_BATCH, {
    input: { diningHallSlug, items },
  }, token);
}

export async function createMenuItemsIndividually(items: CreateMenuItemInput[], token?: string | null) {
  await Promise.all(items.map((input) => graphQLRequest(CREATE_MENU_ITEM, { input }, token)));
}

export async function updateDiningHall(input: UpdateDiningHallInput, token?: string | null) {
  return graphQLRequest(UPDATE_DINING_HALL, { input }, token);
}

export async function deleteDiningHall(id: string, token?: string | null) {
  return graphQLRequest(DELETE_DINING_HALL, { id }, token);
}

export type UpdateMenuItemInput = {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  macros?: MacrosInput | null;
  price?: number | null;
  category?: string | null;
  tags?: string[] | null;
};

// Fixed: Added token as third parameter
export async function updateMenuItem(id: string, input: UpdateMenuItemInput, token?: string | null) {
  return graphQLRequest(UPDATE_MENU_ITEM, { id, input }, token);
}

// Fixed: Added token as second parameter
export async function deleteMenuItem(id: string, token?: string | null) {
  return graphQLRequest(DELETE_MENU_ITEM, { id }, token);
}