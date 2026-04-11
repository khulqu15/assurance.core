import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  sanitizeFileName,
} from './attachment-upload.helper';

export function createAttachmentMulterOptions() {
  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const claimId = req.params.claimId;
        if (!claimId) {
          return cb(new BadRequestException('claimId is required'), '');
        }

        const uploadPath = join(process.cwd(), 'uploads', 'claims', claimId as any);

        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
      },
      filename: (_req, file, cb) => {
        const extension = extname(file.originalname).toLowerCase();
        const baseName = sanitizeFileName(file.originalname.replace(extension, ''));
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
      const extension = extname(file.originalname).toLowerCase();

      const validMime = ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.mimetype);
      const validExt = ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension);

      if (!validMime || !validExt) {
        return cb(
          new BadRequestException(
            'Invalid file type. Only PDF, DOCX, and DOC are allowed.',
          ),
          false,
        );
      }

      cb(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  };
}