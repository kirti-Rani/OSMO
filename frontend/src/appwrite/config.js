import axios from "axios";

// Our custom backend API URL
const API_URL = "/api/posts";

export class Service {
    async createPost({ title, slug, content, featuredImage, status, userId }) {
        try {
            const response = await axios.post(API_URL, {
                title, slug, content, featuredImage, status, userId
            }, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.log("Appwrite serive :: createPost :: error", error);
            return false;
        }
    }

    async updatePost(slug, { title, content, featuredImage, status }) {
        try {
            const response = await axios.patch(`${API_URL}/${slug}`, {
                title, content, featuredImage, status
            }, { withCredentials: true });
            // Mimic appwrite behavior of returning updated doc
            return response.data;
        } catch (error) {
            console.log("Appwrite serive :: updatePost :: error", error);
            return false;
        }
    }

    async deletePost(slug) {
        try {
            await axios.delete(`${API_URL}/${slug}`, { withCredentials: true });
            return true;
        } catch (error) {
            console.log("Appwrite serive :: deletePost :: error", error);
            return false;
        }
    }

    async getPost(slug) {
        try {
            const response = await axios.get(`${API_URL}/${slug}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.log("Appwrite serive :: getPost :: error", error);  
            return false;
        }
    }

    async getPosts(queries) {
        try {
            const response = await axios.get(API_URL, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.log("Appwrite serive :: getPosts :: error", error);
            return false;
        }
    }
 
// file upload

    async uploadFile(file) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.log("Appwrite serive :: uploadFile :: error", error);
            return false;
        }
    }

    async deleteFile(fileId) {
        try {
            await axios.delete(`${API_URL}/file/${fileId}`, { withCredentials: true });
            return true;
        } catch (error) {
            console.log("Appwrite serive :: deleteFile :: error", error);
            return false;
        }
    }

    getFilePreview(fileId) {
        if (!fileId) return "";
        return `/temp/${fileId}`;
    }
}

const service = new Service();
export default service;
