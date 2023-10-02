import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = express.Router();
const { fileQueue } = require('../worker'); // Import the fileQueue
const { userQueue } = require('../worker'); // Import the userQueue

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Add the new endpoint for uploading files and start background processing
router.post('/files', FilesController.postUpload, async (req, res) => {
  const { userId, _id } = res.locals.newFile;
  await fileQueue.add({ fileId: _id, userId });
  res.status(201).json(res.locals.newFile);
});

// Update the endpoint for creating new users to add a job to userQueue
router.post('/users', UsersController.postNew, async (req, res) => {
  const { _id } = res.locals.newUser;
  await userQueue.add({ userId: _id });
  res.status(201).json(res.locals.newUser);
});

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

// Add the endpoints for updating file publication status and retrieving files
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

module.exports = router;
