import axios from "axios";

// Our custom backend API URL
const API_URL = "/api/users";

export class AuthService { 
    async createAccount({ email, password, name }) {
        try {
            const response = await axios.post(`${API_URL}/register`, { email, password, name });
            if (response.data) {
                return await this.login({ email, password });
            } else {
                return response.data;
            }
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    }

    async login({ email, password }) {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
            return response.data; 
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    }
    
    async getCurrentUser() {
        try {
            const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.log("Appwrite serive::getCurrentUser::error", error.response?.data?.message || error.message);
            return null;
        }
    }

    async logout() {
        try {
            await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
        } catch (error) {
            console.log("Appwrite serive::logout::error", error.response?.data?.message || error.message);
        }
    }
}

const authService = new AuthService();
export default authService;
