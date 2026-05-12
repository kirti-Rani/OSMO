import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Controller } from 'react-hook-form';

export default function RTE({name, control, label, defaultValue ="", labelClassName = "text-slate-800"}) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }]
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align'
  ];

  return (
    <div className='w-full mb-12'> 
      {label && <label className={`inline-block mb-1 pl-1 font-semibold tracking-wide ${labelClassName}`}>{label}</label>}

      <Controller
        name={name || "content"}
        control={control}
        defaultValue={defaultValue}
        render={({field: {onChange, value}}) => (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <ReactQuill 
              theme="snow" 
              value={value || defaultValue} 
              onChange={onChange}
              modules={modules}
              formats={formats}
              className="h-[400px] mb-10"
            />
          </div>
        )}
      />
    </div>
  )
}
