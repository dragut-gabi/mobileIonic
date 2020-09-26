import axios from 'axios';
import { getLogger } from '../core';
import { ItemProps } from './ItemProps';

const log = getLogger('itemApi');

const baseUrl = 'http://localhost:3000';

export const getItems: () => Promise<ItemProps[]> = () => {
  log('getItems - started');
  return axios
    .get(`${baseUrl}/item`)
    .then(res => {
      log('getItems - succeeded');
      return Promise.resolve(res.data);
    })
    .catch(err => {
      log('getItems - failed');
      return Promise.reject(err);
    });
}
