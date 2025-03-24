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
    try {
      const result = await uploadFile(file);
      setUploadedUrl(result.url);
    } catch (err: any) {
      console.error(err);
      setError("업로드 중 오류가 발생했어요.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📤 파일 업로드</h1>

      <input type="file" onChange={handleChange} className="mb-4" />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "업로드 중..." : "업로드"}
      </button>

      {uploadedUrl && (
        <div className="mt-4 text-green-600">
          ✅ 업로드 완료:{" "}
          <a href={uploadedUrl} target="_blank" className="underline">
            파일 보기
          </a>
        </div>
      )}

      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
}