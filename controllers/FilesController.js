import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await dbClient.db.collection('users').findOne({ _id: dbClient.getObjectId(userId) });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

    let parent = null;
    if (parentId !== 0) {
      parent = await dbClient.db.collection('files').findOne({ _id: dbClient.getObjectId(parentId) });
      if (!parent) return res.status(400).json({ error: 'Parent not found' });
      if (parent.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    let localPath = null;
    if (type === 'folder') {
      const newDoc = {
        userId: user._id,
        name,
        type,
        isPublic,
        parentId,
      };
      const insertResult = await dbClient.db.collection('files').insertOne(newDoc);
      return res.status(201).json({
        id: insertResult.insertedId.toString(),
        userId: user._id.toString(),
        name,
        type,
        isPublic,
        parentId,
      });
    } else {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

      const filename = uuidv4();
      localPath = path.join(folderPath, filename);
      await fs.promises.writeFile(localPath, Buffer.from(data, 'base64'));

      const newDoc = {
        userId: user._id,
        name,
        type,
        isPublic,
        parentId,
        localPath,
      };
      const insertResult = await dbClient.db.collection('files').insertOne(newDoc);
      return res.status(201).json({
        id: insertResult.insertedId.toString(),
        userId: user._id.toString(),
        name,
        type,
        isPublic,
        parentId,
      });
    }
  }
}

export default FilesController;
