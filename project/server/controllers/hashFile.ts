import HashFile from '../models/hashFile';
import BaseCtrl from './base';
import * as jwt from 'jsonwebtoken';

const nodeFileHashLib = require('node-file-hash');

export default class hashFileCtrl extends BaseCtrl {
  model = HashFile;

  hashFile = (req, res) => {
    nodeFileHashLib.createHash(req.body.binary)
      .then((hash) => {
        res.status(200).json({
          hash: hash
        });
      })
      .catch((err) => console.error(err));
  }
}
