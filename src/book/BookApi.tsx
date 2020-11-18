import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { BookProps } from './BookProps';
import { Plugins } from "@capacitor/core";

const { Storage } = Plugins;
const bookUrl = `http://${baseUrl}/api/book`;

export const getBooks: (token: string) => Promise<BookProps[]> = token => {
  // return withLogs(axios.get(itemUrl, authConfig(token)), 'getItems');
  const result = axios.get(bookUrl, authConfig(token))
  result.then(function (result) {
    result.data.forEach(async (book: BookProps) => {
      await Storage.set({
        key: book._id!,
        value: JSON.stringify({
          id: book._id,
          title: book.title,
          sold: book.sold,
          releaseDate: book.releaseDate,
          pages: book.pages,
        }),
      })
    })
  })

  return withLogs(result, "getBooks");
}

export const createBook: (
    token: string,
    book: BookProps
) => Promise<BookProps[]> = (token, book) => {
  const result = axios.post(bookUrl, book, authConfig(token));
  result.then(async function (r) {
    const book = r.data;
    await Storage.set({
      key: book._id!,
      value: JSON.stringify({
        id: book._id,
        title: book.title,
        book: book.sold,
        releaseDate: book.releaseDate,
        pages: book.pages,
      }),
    });
  });
  return withLogs(result, "createBook");
};

export const updateBook: (
    token: string,
    book: BookProps
) => Promise<BookProps[]> = (token, book) => {
  const result = axios.put(`${bookUrl}/${book._id}`, book, authConfig(token));
  result.then(async function (r) {
    const book = r.data;
    await Storage.set({
      key: book._id!,
      value: JSON.stringify({
        id: book._id,
        title: book.title,
        sold: book.sold,
        releaseDate: book.releaseDate,
        pages: book.pages,
      }),
    })
  })
  return withLogs(result, "updateBook");
};

export const deleteBookApi: (
    token: string,
    book: BookProps
) => Promise<BookProps[]> = (token, book) => {
  const result = axios.delete(`${bookUrl}/${book._id}`, authConfig(token));
  result.then(async function (r) {
    await Storage.remove({ key: book._id! });
  });
  return withLogs(result, "deleteBook");
};

interface MessageData {
  type: string;
  payload: BookProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}