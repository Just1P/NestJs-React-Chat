import axios, { AxiosRequestConfig } from "axios";
import { authService } from "./authService";

const API_URL = "http://localhost:8000/api/messages";

export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    email: string;
  };
  likesCount: number;
  likedBy?: { id: string; email: string }[];
}

export interface CreateMessageDto {
  text: string;
}


const getAuthConfig = (): AxiosRequestConfig => {
  const token = authService.getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const messageService = {
  async create(data: CreateMessageDto): Promise<Message> {
    const response = await axios.post(API_URL, data, getAuthConfig());
    return response.data;
  },

  async findAll(): Promise<Message[]> {
    const response = await axios.get(API_URL);
    return response.data;
  },


  async findOne(id: string): Promise<Message> {
    const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
    return response.data;
  },


  async update(id: string, data: CreateMessageDto): Promise<Message> {
    const response = await axios.patch(`${API_URL}/${id}`, data, getAuthConfig());
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  },

  async likeMessage(id: string): Promise<Message> {
    const response = await axios.post(
      `${API_URL}/${id}/like`,
      {},
      getAuthConfig()
    );
    return response.data;
  },

  async unlikeMessage(id: string): Promise<Message> {
    const response = await axios.delete(`${API_URL}/${id}/like`, getAuthConfig());
    return response.data;
  },


  hasUserLiked(message: Message, userId: string): boolean {
    return !!message.likedBy?.some((user) => user.id === userId);
  },
};
