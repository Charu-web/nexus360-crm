declare module 'multer';
declare module 'pdf-parse';
declare module 'papaparse';
declare module 'uuid';
declare module 'ioredis';
declare module 'winston';

declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
}
