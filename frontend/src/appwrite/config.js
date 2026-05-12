import axios from "axios";

// Our custom backend API URL
const API_URL = "/api/posts";

export class Service {
    async createPost({ title, slug, content, featuredImage, images, status, userId }) {
        try {
            const response = await axios.post(API_URL, {
                title, slug, content, featuredImage, images, status, userId
            }, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.log("Appwrite serive :: createPost :: error", error);
            return false;
        }
    }

    async updatePost(slug, { title, content, featuredImage, images, status }) {
        try {
            const response = await axios.patch(`${API_URL}/${slug}`, {
                title, content, featuredImage, images, status
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

    async toggleLike(slug) {
        try {
            const response = await axios.post(`${API_URL}/${slug}/like`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.log("Appwrite serive :: toggleLike :: error", error);
            return false;
        }
    }

    async addComment(slug, text) {
        try {
            const response = await axios.post(`${API_URL}/${slug}/comment`, { text }, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.log("Appwrite serive :: addComment :: error", error);
            return false;
        }
    }
 
// file upload

    async uploadFile(file) {
        try {
            const formData = new FormData();
            formData.append("images", file); // Changed to 'images' to match the new route
            
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

    async uploadImages(files) {
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append("images", files[i]);
            }
            
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            return response.data; // Should return { $id, fileIds: [...] }
        } catch (error) {
            console.log("Appwrite serive :: uploadImages :: error", error);
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
        if (fileId.startsWith("http")) return fileId;
        return `/temp/${fileId}`;
    }
}

const service = new Service();
export default service;
