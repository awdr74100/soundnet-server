import { Request, Response } from 'express';
import { db } from '../connection/firebase-admin';

interface UserPayload {
  uid: string;
  email: string;
  displayName: string;
  soundId: string;
  features: string[];
}

interface UserDocument {
  [uid: string]: {
    email: string;
    displayName: string;
    soundId: string;
    features: string[];
  };
}

interface Sound {
  [id: string]: {
    hash: string;
  };
}

export const signUp = async (req: Request, res: Response): Promise<void> => {
  const { uid, email, displayName, features } = req.body as UserPayload;

  try {
    const sounds = (await db.ref('/sounds').once('value')).val() as Sound;
    const soundIds = Object.keys(sounds);
    const random = Math.floor(Math.random() * soundIds.length);
    const soundId = soundIds[random];

    await db
      .ref(`/users/${uid}`)
      .set({ email, displayName, soundId, features });

    res.send({ success: true, message: '註冊成功' });
  } catch (error) {
    res.status(500).send({ success: false, message: (error as Error).message });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.body as UserPayload;

  try {
    const user = (
      await db.ref(`/users/${uid}`).once('value')
    ).val() as UserDocument;

    if (!user) throw new Error('custom/USER_NOT_EXIST');

    res.send({ success: true, user });
  } catch (error) {
    if ((error as Error).message === 'custom/USER_NOT_EXIST') {
      res.send({ success: false, message: '用戶尚未註冊' });
      return;
    }
    res.status(500).send({ success: false, message: (error as Error).message });
  }
};
