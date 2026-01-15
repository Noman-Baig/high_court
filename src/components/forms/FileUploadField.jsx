// components/FileUploadField.jsx
import React from "react";

const FileUploadField = ({
  id,
  name,
  label,
  description,
  accept,
  file,
  onChange,
  onRemove,
  required = false,
  error = null,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-1">
        <label className="font-medium block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
        />
        <label
          htmlFor={id}
          className="inline-block px-3 py-1.5 border rounded-md cursor-pointer hover:bg-gray-100 text-sm"
        >
          Choose file
        </label>

        <div className="text-xs text-gray-600 max-w-[160px] truncate">
          {file ? file.name : "No file chosen"}
        </div>

        {file && (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-600 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default FileUploadField;
