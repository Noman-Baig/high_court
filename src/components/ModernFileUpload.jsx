import React, { useState } from "react";
const ModernFileUpload = ({
  label,
  description,
  accept,
  file,
  preview,
  onChange,
  onRemove,
  required = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      style={{
        border: "2px dashed #e0e0e0",
        borderRadius: "16px",
        padding: "5px",
        textAlign: "center",
        background: isDragOver ? "#f0e6ff" : "#fafbfd",
        transition: "all 0.3s ease",
        position: "relative",
        cursor: "pointer",
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
    >
      <label style={{ cursor: "pointer", display: "block" }}>
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          style={{ display: "none" }}
          name={label.toLowerCase().replace(/\s+/g, "")}
        />

        {/* Preview or Icon */}
        {preview || file ? (
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              margin: "0 auto 16px",
              border: "4px solid #fff",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src={preview || URL.createObjectURL(file)}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#e0e7ff",
              borderRadius: "50%",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "36px", color: "#764ba2" }}>📄</span>
          </div>
        )}

        {/* Label & Description */}
        <p
          style={{
            fontWeight: 600,
            color: "#333",
            margin: "0 0 4px 0",
            fontSize: "0.9rem",
          }}
        >
          {label} {required && <span style={{ color: "#e74c3c" }}>*</span>}
        </p>
        <p
          style={{
            color: "#666",
            fontSize: "0.9rem",
            margin: "0 0 12px 0",
          }}
        >
          {description || "Click or drag file here"}
        </p>

        {/* File Name or Instruction */}
        {file ? (
          <p
            style={{
              color: "#4b9f71",
              fontWeight: 500,
              fontSize: "0.95rem",
              wordBreak: "break-all",
            }}
          >
            {file.name}
          </p>
        ) : (
          <p style={{ color: "#999", fontSize: "0.9rem" }}>Max 2MB</p>
        )}
      </label>

      {/* Remove Button */}
      {file && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "#fff",
            border: "none",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            color: "#e74c3c",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ModernFileUpload;
