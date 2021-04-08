import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 10 }, // Bytes (10MB)
  fileFilter(req, file, cb) {
    const rx = /\.(mp3)$/i;
    if (rx.test(file.originalname)) return cb(null, true);
    return cb(new Error('Invalid file type'));
  },
});

export const errorHandling = (
  err: multer.MulterError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err.message === 'Invalid file type') {
    res.send({ success: false, message: '不支援的檔案格式' });
    return;
  }
  if (err.message === 'File too large') {
    res.send({ success: false, message: '超過檔案限制大小' });
    return;
  }
  if (err.message === 'Unexpected field' && err.field === 'sounds') {
    res.send({ success: false, message: '超過上傳數量限制' });
    return;
  }
  if (err.message === 'Unexpected field') {
    res.send({ success: false, message: '欄位名稱不正確' });
    return;
  }
  res.status(500).send({ success: false, message: err.message });
};
