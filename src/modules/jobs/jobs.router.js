import { Router } from 'express';

import { authenticate, validate } from '~/helpers';
import * as controller from './jobs.controller';

const router = new Router();

router.get('/', authenticate, controller.browse);
router.get('/:id', authenticate, controller.read);

export default router;
