import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import aiService from "../../services/aiService";

export default function PostForm({ post }) {
    const [aiPromptOpen, setAiPromptOpen] = useState(false);
    const [aiQuery, setAiQuery] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");

    const { register, handleSubmit, watch, setValue, control, getValues, formState: { errors } } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        if (post) {
            let newImages = post.images || (post.featuredImage ? [post.featuredImage] : []);
            let newFeaturedImage = post.featuredImage;

            if (data.images && data.images.length > 0) {
                const files = Array.from(data.images).slice(0, 5);
                const response = await appwriteService.uploadImages(files);
                if (response && response.fileIds) {
                    newImages = response.fileIds;
                    newFeaturedImage = response.$id;

                    if (post.featuredImage) {
                        appwriteService.deleteFile(post.featuredImage);
                    }
                    if (post.images && post.images.length > 0) {
                        post.images.forEach(id => {
                            if (id !== post.featuredImage) appwriteService.deleteFile(id);
                        });
                    }
                }
            }

            const dbPost = await appwriteService.updatePost(post.$id, {
                ...data,
                featuredImage: newFeaturedImage,
                images: newImages,
            });

            if (dbPost) {
                navigate(`/post/${dbPost.$id}`);
            }
        } else {
            let newImages = [];
            let newFeaturedImage = undefined;
            if (data.images && data.images.length > 0) {
                const files = Array.from(data.images).slice(0, 5);
                const response = await appwriteService.uploadImages(files);
                if (response && response.fileIds) {
                    newImages = response.fileIds;
                    newFeaturedImage = response.$id;
                }
            }

            const dbPost = await appwriteService.createPost({ 
                ...data, 
                featuredImage: newFeaturedImage,
                images: newImages,
                userId: userData.$id 
            });

            if (dbPost) {
                navigate(`/post/${dbPost.$id}`);
            }
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");

        return "";
    }, []);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    const handleAIGenerate = async () => {
        if (!aiQuery.trim()) return;
        setIsAiLoading(true);
        setAiError("");
        try {
            const generated = await aiService.generateBlogPost(aiQuery);
            if (generated.title) {
                setValue("title", generated.title, { shouldValidate: true });
                setValue("slug", slugTransform(generated.title), { shouldValidate: true });
            }
            if (generated.content) {
                setValue("content", generated.content, { shouldValidate: true });
            }
            setAiPromptOpen(false);
            setAiQuery("");
        } catch (error) {
            setAiError(error.message || "Failed to generate AI content. Make sure your API key is correctly configured.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap p-4 mt-2 mx-auto">
            {Object.keys(errors).length > 0 && (
                <div className="w-full text-red-500 mb-4 px-2">
                    Please fill out all required fields: {Object.keys(errors).join(", ")}.
                </div>
            )}
            <div className="w-2/3 px-2">
                {/* AI Assistant Section */}
                <div className="mb-6 p-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm relative">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                            ✨ AI Post Assistant
                        </h3>
                        <button
                            type="button"
                            onClick={() => setAiPromptOpen(!aiPromptOpen)}
                            className="text-sm px-3 py-1.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                            {aiPromptOpen ? "Close AI" : "Ask AI to Write"}
                        </button>
                    </div>

                    {aiPromptOpen && (
                        <div className="mt-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                            <input
                                type="text"
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                placeholder="E.g., Write a 3 paragraph blog post about learning React basics"
                                className="w-full px-4 py-2 border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            {aiError && <p className="text-red-500 text-xs">{aiError}</p>}
                            <button
                                type="button"
                                disabled={isAiLoading || !aiQuery.trim()}
                                onClick={handleAIGenerate}
                                className="self-end px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {isAiLoading ? "Generating ✨..." : "Generate Magic"}
                            </button>
                        </div>
                    )}
                </div>

                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    labelClassName="text-teal-50 drop-shadow-sm"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    labelClassName="text-teal-50 drop-shadow-sm"
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} labelClassName="text-teal-50 drop-shadow-sm" />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Images (Max 5) :"
                    type="file"
                    multiple
                    className="mb-4 bg-white/95 text-slate-800"
                    labelClassName="text-teal-50 drop-shadow-sm"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("images")}
                />
                {post && (post.images?.length > 0 || post.featuredImage) && (
                    <div className="w-full mb-4 flex gap-2 overflow-x-auto pb-2">
                        {(post.images?.length > 0 ? post.images : [post.featuredImage]).map((img, idx) => (
                            <img
                                key={idx}
                                src={appwriteService.getFilePreview(img)}
                                alt={`post preview ${idx}`}
                                className="rounded-lg shadow-lg border border-white/20 h-24 object-cover flex-shrink-0"
                            />
                        ))}
                    </div>
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    labelClassName="text-teal-50 drop-shadow-sm"
                    {...register("status", { required: true })}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );

}
