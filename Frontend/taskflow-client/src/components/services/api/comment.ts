import api from "./axios";

export interface Comment {
  id: number;
  content: string;
  cardId: number;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  cardId: number;
}

export const commentService = {
  getCommentsByCard: async (cardId: number | string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/comments/card/${cardId}`);
    return response.data;
  },

  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post<Comment>("/comments", data);
    return response.data;
  },

  deleteComment: async (id: number | string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
};
