import cloudinary  from "../config/cloudinary.js";
import fs from "fs/promises";
import File from "./fileModel.js";
import db from "../config/db.js";

class PostFilesManager {
  constructor(postId) {
    this.postId = postId;
    this.uploadedFiles = [];
  }

  async uploadFilesToCloudinary(files) {
    try {
      for (const file of files) {
        let result;

        if (file.fieldname === "images") {
          result = await cloudinary.uploader.upload(file.path, {
            folder: "uploads/images",
          });
          this.uploadedFiles.push(
            await File.addFile(this.postId, result.secure_url, "image")
          );
        } else if (file.fieldname === "documents") {
          result = await cloudinary.uploader.upload(file.path, {
            folder: "uploads/documents",
            resource_type: "raw",
          });
          this.uploadedFiles.push(
            await File.addFile(this.postId, result.secure_url, "document")
          );
        }

        await fs.unlink(file.path); // Изтриване на локалния файл
      }
    } catch (err) {
      console.error("Error uploading files to Cloudinary:", err);
      throw err;
    }
  }

  // DELETE all files for a specific post from Cloudinary
  async deleteAllFiles() {
    try {
      await this.getFiles();
      for (const file of this.uploadedFiles) {
        await file.deleteFromCloudinary();
      }
    } catch (err) {
      console.error("Error deleting files from Cloudinary:", err);
      throw err;
    }
  }

  // READ all files for a specific post
  async getFiles() {
    try {
      const result = await db.query(
        `SELECT * FROM post_files WHERE post_id = $1;`,
        [this.postId]
      );
      this.uploadedFiles = result.rows.map(
        (file) => new File(file.file_id, file.post_id, file.url, file.type, file.upload_date)
      );
    } catch (err) {
      console.error("Error fetching files for post:", err);
      throw err;
    }
  }
}

export default PostFilesManager;