import { Request, Response } from 'express';
import { db } from '../connection/firebase-admin';

interface UserPayload {
  uid: string;
  email: string;
  displayName: string;
  soundId: string;
  features: string[];
}

interface VerifyPayload {
  soundId: string;
  hash: string;
}

export const call = (req: Request, res: Response): void => {
  const { uid, soundId } = req.body as UserPayload;
  const { wss } = req.app;

  wss.clients.forEach((client) => {
    client.send(
      JSON.stringify({
        title: ' WebSockets broadcast',
        target: ['webview', 'arduino'],
        body: {
          uid,
          soundId,
        },
      }),
    );
  });

  res.send({ success: true });
};

export const verify = async (req: Request, res: Response): Promise<void> => {
  const { soundId, hash } = req.body as VerifyPayload;
  const { wss } = req.app;

  try {
    const sound = (await db.ref(`/sounds/${soundId}`).once('value')).val() as {
      hash: string;
    };

    if (!sound) throw new Error('custom/SOUND_NOT_EXIST');

    if (sound.hash !== hash) throw new Error('custom/VERIFY_ERROR');

    wss.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          title: ' WebSockets broadcast',
          target: ['door'],
        }),
      );
    });

    res.send({ success: true });
  } catch (error) {
    if ((error as Error).message === 'custom/SOUND_NOT_EXIST') {
      res.send({ success: false, message: '找不到檔案' });
      return;
    }
    if ((error as Error).message === 'custom/VERIFY_ERROR') {
      res.send({ success: false, message: '驗證失敗' });
      return;
    }
    res.status(500).send({ success: false, message: (error as Error).message });
  }
};
