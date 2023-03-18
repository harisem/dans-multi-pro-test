import { APIError, successRes, pagination, search } from '~/helpers';
import { DANS_PRO_API } from '@env';
import axios from 'axios';

export const browse = async (req, res) => {
  const response = await axios.get(`${DANS_PRO_API}positions.json`);
  let data = response.data;

  if (data.length > 0) {
    if (req.query.description && req.query.description.length > 0)
      data = search(data, req.query.description, 'description');
    if (req.query.location && req.query.location.length > 0)
      data = search(data, req.query.location, 'location');
    if (req.query.full_time == 'true') data = search(data, 'full time', 'type');
  }

  pagination(res, data, null, req);
};

export const read = async (req, res) => {
  const response = await axios.get(`${DANS_PRO_API}positions/${req.params.id}`);
  let data = response.data;
  if (!data) throw new APIError('Data not found.', 404);

  successRes(res, data);
};
