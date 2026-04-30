import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        featuredImage: {
            type: String, // Legacy, kept for backward compatibility
            required: false // Changed to false to allow new posts to use `images` instead
        },
        images: [{
            type: String
        }],
        status: {
            type: String,
            required: true,
            default: "active"
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        comments: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            text: {
                type: String,
                required: true,
                trim: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    {
        timestamps: true
    }
);

export const Post = mongoose.model("Post", postSchema);
