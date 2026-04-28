import { User } from "../models/user.model.js";

const generateAccessTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        return accessToken;
    } catch (error) {
        throw new Error("Something went wrong while generating token");
    }
}

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        const existedUser = await User.findOne({ email });
        if (existedUser) {
            return res.status(409).json({message: "User with email already exists"});
        }

        const user = await User.create({
            name,
            email,
            password
        });

        const createdUser = await User.findById(user._id).select("-password -__v");

        if (!createdUser) {
            return res.status(500).json({message: "Something went wrong while registering the user"});
        }

        // Like Appwrite's createAccount, we return the created user
        return res.status(201).json(createdUser);

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({message: "Email and password is required"});
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({message: "User does not exist"});
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return res.status(401).json({message: "Invalid user credentials"});
        }

        const accessToken = await generateAccessTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -__v");

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json({
                user: loggedInUser,
                accessToken
            });

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

export const logoutUser = async (req, res) => {
    try {
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .json({message: "User logged out"});

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({message: "Not found"});
        }
        // Return mostly what Appwrite returns
        return res.status(200).json({
            $id: req.user._id,
            name: req.user.name,
            email: req.user.email
        });
    } catch (error) {
         return res.status(500).json({message: error.message});
    }
};
