const Queue = require('bull');
const thumb = require('image-thumbnail');
const fs = require('fs');
const path = require('path');
const { dbClient } = require('./utils/db');

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const db = dbClient.client.db();
  const filesCollection = db.collection('files');
  const file = await filesCollection.findOne({ _id: fileId, userId });

  if (!file) {
    throw new Error('File not found');
  }

  if (file.type !== 'image') {
    // Only generate thumbnails for image files
    return;
  }

  const { localPath } = file;
  const outputDir = path.dirname(localPath);

  try {
    const sizes = [500, 250, 100];
    for (const size of sizes) {
      const thumbnail = thumb(localPath, {
        width: size,
      });

      const thumbnailPath = path.join(outputDir,
        `${path.basename(localPath, path.extname(localPath))}_${size}${path.extname(localPath)}`);
      fs.writeFileSync(thumbnailPath, thumbnail);
    }
  } catch (error) {
    console.error('Error generating thumbnails:', error);
  }
});

const userQueue = new Queue('userQueue');

userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const db = dbClient.client.db();
  const usersCollection = db.collection('users');
  const user = await usersCollection.findOne({ _id: userId });

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`); // In a real application, send the welcome email here
});
