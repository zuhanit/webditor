"use client";

import { uploadFile } from "@/lib/firebase/db";
import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    uploadFile(file)
      .then((result) => {
        setUploadedUrl(result.url);
      })
      .catch((reason) => {
        console.error(reason);
        setError("Error raised while uploading");
      })
      .finally(() => setUploading(false));
  };

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-2xl font-bold">📤 파일 업로드</h1>

      <input type="file" onChange={handleChange} className="mb-4" />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {uploading ? "업로드 중..." : "업로드"}
      </button>

      {uploadedUrl && (
        <div className="text-green-600 mt-4">
          ✅ 업로드 완료:{" "}
          <a href={uploadedUrl} target="_blank" className="underline">
            파일 보기
          </a>
        </div>
      )}

      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
