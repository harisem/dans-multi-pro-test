import { Router } from 'express';

import { validate } from '~/helpers';
import * as controller from './users.controller';
import * as rules from './users.rules';

const router = new Router();

router.post('/login', validate(rules.loginRules), controller.login);

export default router;
