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
            type: String, // String path to the image
            required: true
        },
        status: {
            type: String,
            required: true,
            default: "active"
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

export const Post = mongoose.model("Post", postSchema);
