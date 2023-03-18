import { APIError, successRes } from '~/helpers';
import { Models } from '~/models';

export const login = async (req, res) => {
  let user = await Models.User.findOne({
    where: { username: req.body.username },
  });

  if (!user) throw new APIError('Account not found.', 404);

  const isValidPassword = await user.validatePassword(req.body.password);
  if (!isValidPassword) throw new APIError('Invalid credential.', 400);

  const token = user.generateToken();

  const data = JSON.parse(JSON.stringify(user));
  data.token = token;

  delete data.password;

  successRes(res, data, 'Successfully login.');
};
