import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { bucket, db } from '../connection/firebase-admin';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface Sound {
  [id: string]: {
    hash: string;
  };
}

interface Metadata {
  contentType: string;
  size: string;
}

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !req.files.length) throw new Error('custom/EMPTY_FILES');

    const soundArray = await Promise.all(
      (req.files as MulterFile[]).map((file) => {
        const id = uuid();
        const hash = file.originalname.split('.')[0];
        return bucket
          .file(`sounds/${id}`)
          .save(file.buffer, {
            gzip: false,
            resumable: false,
            contentType: file.mimetype,
          })
          .then(() => ({ id, hash }));
      }),
    );

    const updateObject = soundArray.reduce<Sound>((acc, { id, hash }) => {
      acc[id] = { hash };
      return acc;
    }, {});

    await db.ref('/sounds/').update(updateObject);

    res.send({ success: true, message: '上傳成功' });
  } catch (error) {
    if ((error as Error).message === 'custom/EMPTY_FILES') {
      res.send({ success: false, message: '禁止欄位輸入為空' });
      return;
    }
    res.status(500).send({ success: false, message: (error as Error).message });
  }
};

export const read = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { range } = req.headers;
  const remoteFile = bucket.file(`sounds/${id}`);

  try {
    const metadata = await remoteFile.getMetadata();
    const { size, contentType } = metadata[0] as Metadata;

    if (range) {
      const [partialStart, partialEnd] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(partialStart, 10);
      const end = partialEnd ? parseInt(partialEnd, 10) : +size - 1;

      res.status(206).header({
        'Content-Type': contentType,
        'Content-Length': +size,
        'Content-Range': `bytes ${start}-${end}/${size}`,
      });
      remoteFile
        .createReadStream({ start, end })
        .on('error', (err) => res.send({ success: false, error: err }))
        .pipe(res);
      return;
    }

    res.header({
      'Content-Type': contentType,
      'Content-Length': +size,
    });
    remoteFile
      .createReadStream()
      .on('error', (err) => res.send({ success: false, error: err }))
      .pipe(res);
  } catch (error) {
    res.send({ success: false, message: (error as Error).message });
  }
};
