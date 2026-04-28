import { GoogleGenerativeAI } from "@google/generative-ai";

export class AIService {
    constructor() {
        this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
        }
    }

    async generateBlogPost(topic) {
        if (!this.apiKey) {
            throw new Error("Missing VITE_GEMINI_API_KEY in environment variables.");
        }

        const prompt = `You are an expert blog post generator. Write a blog post about: "${topic}".
Format your entire response exactly as a raw JSON object with two keys (do NOT include any markdown codeblocks like \`\`\`json, just output pure raw JSON):
{
  "title": "A catchy title here",
  "content": "The HTML content of the blog post here using <p>, <h2>, <strong> etc."
}`;

        try {
            // Using gemini-1.5-flash as it is the currently supported standard text model
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            if (!responseText) {
                throw new Error("AI returned an empty response.");
            }

            // Clean any potential markdown around the JSON
            const cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
            const jsonResult = JSON.parse(cleanText);

            return {
                title: jsonResult.title || "",
                content: jsonResult.content || ""
            };
        } catch (error) {
            console.error("AI Generation SDK Error:", error);
            throw new Error(error.message || "Failed to generate AI content via SDK.");
        }
    }
}

const aiService = new AIService();
export default aiService;
