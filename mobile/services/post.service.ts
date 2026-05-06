import axiosInstance from '../utils/axios';

export interface Comment {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
  };
  content: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export const postService = {
  getPosts: async (): Promise<Post[]> => {
    const response = await axiosInstance.get('/posts');
    return response.data;
  },

  createPost: async (content: string): Promise<Post> => {
    const response = await axiosInstance.post('/posts', { content });
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/posts/${id}`);
  },

  updatePost: async (id: string, content: string): Promise<Post> => {
    const response = await axiosInstance.put(`/posts/${id}`, { content });
    return response.data;
  },

  addComment: async (postId: string, content: string): Promise<Post> => {
    const response = await axiosInstance.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },
};
