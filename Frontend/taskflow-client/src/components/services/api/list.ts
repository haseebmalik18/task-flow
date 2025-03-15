import api from "./axios";
import { Card } from "./card";

export interface BoardList {
  id: number;
  title: string;
  boardId: number;
  position: number;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateListRequest {
  title: string;
  boardId: number;
  position?: number;
}

export const listService = {
  getListsByBoard: async (boardId: number | string): Promise<BoardList[]> => {
    const response = await api.get<BoardList[]>(`/lists/board/${boardId}`);
    return response.data;
  },

  createList: async (data: CreateListRequest): Promise<BoardList> => {
    const response = await api.post<BoardList>("/lists", data);
    return response.data;
  },

  updateList: async (
    id: number | string,
    data: CreateListRequest
  ): Promise<BoardList> => {
    const response = await api.put<BoardList>(`/lists/${id}`, data);
    return response.data;
  },

  deleteList: async (id: number | string): Promise<void> => {
    await api.delete(`/lists/${id}`);
  },
};
