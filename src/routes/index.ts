/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import * as soundController from '../controllers/soundController';
import * as userController from '../controllers/userController';
import * as serverController from '../controllers/serverController';
import * as uploadHandler from '../middleware/uploadHandler';

const router = Router();

/* Sound Routes */
router.post(
  '/sounds',
  uploadHandler.upload.array('sounds', 5),
  uploadHandler.errorHandling,
  soundController.upload,
);
router.get('/sounds/:id', soundController.read);

/* User Routes */
router.post('/users/signup', userController.signUp);
router.post('/users/signin', userController.signIn);

/* Server Routes */
router.post('/server/call', serverController.call);
router.post('/server/verify', serverController.verify);

export default router;
