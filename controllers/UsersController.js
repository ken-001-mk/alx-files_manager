import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db';

const userQueue = new Queue('userQueue');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const user = await dbClient.getUser({ email });
    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const hashPassword = sha1(password);
    const result = await dbClient.users.insertOne({ email, password: hashPassword });
    const { _id } = result.ops[0];
    userQueue.add({ userId: _id });
    res.status(201).json({ id: _id, email });
  }

  static async getMe(req, res) {
    const { userId } = req;
    const user = await dbClient.users.findOne({ _id: userId });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    delete user.password;
    res.status(200).json(user);
  }
}

export default UsersController;
