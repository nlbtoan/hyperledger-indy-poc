import NursingHome from '../models/nursingHome';
import BaseCtrl from './base';
import * as jwt from 'jsonwebtoken';

export default class nursingHomeCtrl extends BaseCtrl {
  model = NursingHome;

  login = (req, res) => {
    this.model.findOne({ email: req.body.email }, (err, user) => {
      if (!user) { return res.sendStatus(403); }
      user.comparePassword(req.body.password, (error, isMatch) => {
        if (!isMatch) { return res.sendStatus(403); }
        const token = jwt.sign({ user: user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
        res.status(200).json({ token: token });
      });
    });
  }
}
