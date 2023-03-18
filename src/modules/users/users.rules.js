import { body } from 'express-validator';

export const loginRules = [
  body('username').notEmpty(),
  body('password').notEmpty(),
];
