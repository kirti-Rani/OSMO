import React, { useId } from 'react'

const Input = React.forwardRef( function Input({
    label,
    type = "text",
    className = "",
    labelClassName = "text-slate-800",
    ...props
}, ref){
    const id = useId()
    return (
        <div className='w-full'>
            {label && <label 
            className={`inline-block mb-1 pl-1 font-semibold tracking-wide ${labelClassName}`} 
            htmlFor={id}>
                {label}
            </label>
            }
            <input
            type={type}
            className={`px-3 py-2 rounded-lg bg-white text-slate-900 outline-none focus:bg-slate-50 duration-200 border border-slate-200 w-full ${className}`}
            ref={ref}
            {...props}
            id={id}
            />
        </div>
    )
})
export default Input
