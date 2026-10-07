import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { validate } from '../middlewares/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
} from '../validation/userSchemas.js';

const validateId = validate({ params: userIdParamsSchema });

export const userRouter = Router();

userRouter.get('/', userController.listUsers);
userRouter.get('/:id', validateId, userController.getUser);
userRouter.post('/', validate({ body: createUserSchema }), userController.createUser);
userRouter.put(
  '/:id',
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  userController.updateUser,
);
userRouter.delete('/:id', validateId, userController.deleteUser);
