import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

const ALLOWED = ['.pdf', '.jpg', '.jpeg', '.png'];

export function notaFiscalStorage(entityType: string) {
  return diskStorage({
    destination: (_req, _file, cb) => {
      const dir = join(process.cwd(), 'uploads', 'notas-fiscais', entityType);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const id = req.params.paymentId ?? req.params.id ?? 'file';
      cb(null, `${id}-${Date.now()}${extname(file.originalname).toLowerCase()}`);
    },
  });
}

export const notaFiscalFilter = (
  _req: unknown,
  file: Express.Multer.File,
  cb: (err: Error | null, accept: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();
  if (ALLOWED.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG and PNG are accepted'), false);
  }
};

export function buildNfPath(entityType: string, filename: string) {
  return `/uploads/notas-fiscais/${entityType}/${filename}`;
}

export function deleteNfFile(path: string | null) {
  if (!path) return;
  const full = join(process.cwd(), path);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}
