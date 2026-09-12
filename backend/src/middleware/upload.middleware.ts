import fs from "fs";
import path from "path";
import multer from "multer";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    callback(null, UPLOAD_DIR);
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();

    callback(null, `product-${req.params.id}-${Date.now()}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(new Error("Only JPEG, PNG, or WEBP images are allowed"));
    return;
  }

  callback(null, true);
}

export const productImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");
