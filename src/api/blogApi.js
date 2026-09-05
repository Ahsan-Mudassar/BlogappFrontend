import api from "./axios";

export const getAllBlogs = ({ page = 1, limit = 9, signal } = {}) =>
  api.get("/blog", { params: { page, limit }, signal });

export const getBlogById = (id, { signal } = {}) =>
  api.get(`/blog/${id}`, { signal });

export const getMyBlogs = ({ page = 1, limit = 9, signal } = {}) =>
  api.get("/blog/user/my-blogs", { params: { page, limit }, signal });

export const createBlog = (formData, { onUploadProgress } = {}) =>
  api.post("/blog/create", formData, { onUploadProgress });

export const updateBlog = (id, formData, { onUploadProgress } = {}) =>
  api.patch(`/blog/${id}`, formData, { onUploadProgress });

export const deleteBlog = (id) => api.delete(`/blog/${id}`);