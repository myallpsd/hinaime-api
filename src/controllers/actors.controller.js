import { extractCharacterDetail } from '../extractor/extractCharacterDetail.js';
import { axiosInstance } from '../services/axiosInstance.js';
import { NotFoundError, validationError } from '../utils/errors.js';
import normalizePersonId from '../utils/normalizePersonId.js';

const actorsController = async (c) => {
  const id = c.req.param('id');

  if (!id) throw new validationError('id is required');

  const normalizedId = normalizePersonId(id, 'people');
  const result = await axiosInstance(`/${normalizedId.replace(':', '/')}`);
  if (!result.success) {
    throw new validationError('make sure given endpoint is correct');
  }

  const response = extractCharacterDetail(result.data);

  if (response.length < 1) throw new NotFoundError();
  return response;
};

export default actorsController;
