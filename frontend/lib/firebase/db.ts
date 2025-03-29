import axios from "axios";
import { getUserIdToken } from "./auth";

export async function uploadFile(file: File) {
  const token = await getUserIdToken();

  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("http://localhost:8000/api/v1/maps/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return res.data;
}