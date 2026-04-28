import React from "react";

function Button({
    children,
    type = "button",
    bgColor = "bg-indigo-600",
    textColor = "text-white",
    className = "",
    ...props
}) {
    return (
        <button type={type} className={`px-4 py-2 rounded-lg ${bgColor} ${textColor} hover:bg-opacity-90 ${className}`} {...props}>
            {children}
        </button>
    );
}

export default Button
