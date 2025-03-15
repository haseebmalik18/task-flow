import api from "./axios";

export interface Board {
  id: number;
  title: string;
  backgroundColor: string;
  workspace: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardRequest {
  title: string;
  backgroundColor: string;
  workspace?: string;
}

export const boardService = {
  getBoards: async (): Promise<Board[]> => {
    const response = await api.get<Board[]>("/boards");
    return response.data;
  },

  createBoard: async (data: CreateBoardRequest): Promise<Board> => {
    const response = await api.post<Board>("/boards", data);
    return response.data;
  },

  getBoard: async (id: number | string): Promise<Board> => {
    const response = await api.get<Board>(`/boards/${id}`);
    return response.data;
  },

  updateBoard: async (
    id: number | string,
    data: CreateBoardRequest
  ): Promise<Board> => {
    const response = await api.put<Board>(`/boards/${id}`, data);
    return response.data;
  },

  deleteBoard: async (id: number | string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },
};
