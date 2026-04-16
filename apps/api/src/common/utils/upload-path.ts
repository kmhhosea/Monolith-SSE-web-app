import { mkdirSync } from 'fs';
import { isAbsolute, resolve } from 'path';

const DEFAULT_UPLOAD_DIR = './apps/api/uploads';

export const resolveUploadDir = (uploadDir = process.env.UPLOAD_DIR ?? DEFAULT_UPLOAD_DIR) =>
  isAbsolute(uploadDir) ? uploadDir : resolve(process.cwd(), uploadDir);

export const ensureUploadDir = (uploadDir = process.env.UPLOAD_DIR ?? DEFAULT_UPLOAD_DIR) => {
  const resolvedPath = resolveUploadDir(uploadDir);
  mkdirSync(resolvedPath, { recursive: true });
  return resolvedPath;
};
