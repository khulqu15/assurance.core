import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

export const ALLOWED_ATTACHMENT_EXTENSIONS = ['.pdf', '.docx', '.doc'];

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateAttachmentFile(file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('File is required');
  }

  if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestException(
      'Invalid file type. Only PDF, DOCX, and DOC are allowed.',
    );
  }

  if (file.size > MAX_ATTACHMENT_SIZE) {
    throw new BadRequestException('File size exceeds 10 MB limit');
  }

  const extension = extname(file.originalname).toLowerCase();
  if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension)) {
    throw new BadRequestException(
      'Invalid file extension. Only .pdf, .docx, and .doc are allowed.',
    );
  }

  return extension;
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-_]/g, '')
    .toLowerCase();
}