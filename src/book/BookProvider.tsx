import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { BookProps } from './BookProps';
import {createBook, getBooks, newWebSocket, updateBook, deleteBookApi, getBook} from './BookApi';
import { AuthContext } from '../auth';
import {Plugins} from "@capacitor/core";
const { Storage } = Plugins;

const log = getLogger('BookProvider');

type SaveBookFn = (book: BookProps,connected:boolean) => Promise<any>
type DeleteBookFn = (book: BookProps,connected:boolean) => Promise<any>
type UpdateServerFn = () => Promise<any>
type ServerItem = (id: string, version: number) => Promise<any>

export interface BooksState {
  books?: BookProps[],
  oldBook?: BookProps,
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  deleting: boolean,
  savingError?: Error | null,
  deletingError?: Error | null,
  saveBook?: SaveBookFn,
  deleteBook?: DeleteBookFn
  updateServer? :UpdateServerFn,
  getServerItem?: ServerItem
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: BooksState = {
  fetching: false,
  saving: false,
  deleting: false,
  oldBook: undefined
};

const FETCH_BOOKS_STARTED = 'FETCH_BOOKS_STARTED';
const FETCH_BOOKS_SUCCEEDED = 'FETCH_BOOKS_SUCCEEDED';
const FETCH_BOOKS_FAILED = 'FETCH_BOOKS_FAILED';
const SAVE_BOOK_STARTED = 'SAVE_BOOK_STARTED';
const SAVE_BOOK_SUCCEEDED = 'SAVE_BOOK_SUCCEEDED';
const SAVE_BOOK_SUCCEEDED_OFFLINE = 'SAVE_BOOK_SUCCEEDED_OFFLINE'
const SAVE_BOOK_FAILED = 'SAVE_BOOK_FAILED';
const DELETE_BOOK_STARTED = 'DELETE_BOOK_STARTED'
const DELETE_BOOK_SUCCEEDED = 'DELETE_BOOK_SUCCEEDED'
const DELETE_BOOK_FAILED = 'DELETE_BOOK_FAILED'
const CONFLICT = 'CONFLICT'
const CONFLICT_SOLVED = 'CONFLICT_SOLVED'

const reducer: (state: BooksState, action: ActionProps) => BooksState =
    (state, { type, payload }) => {
      switch (type) {
        case FETCH_BOOKS_STARTED:
          return { ...state, fetching: true, fetchingError: null };
        case FETCH_BOOKS_SUCCEEDED:
          return { ...state, books: payload.books, fetching: false };
        case FETCH_BOOKS_FAILED:
          return { ...state, fetchingError: payload.error, fetching: false };
        case SAVE_BOOK_STARTED:
          return { ...state, savingError: null, saving: true };
        case SAVE_BOOK_SUCCEEDED_OFFLINE: {
          const books = [...(state.books || [])];
          const book = payload.book;
          const index = books.findIndex(it => it._id === book._id);
          if (index === -1) {
            books.splice(0, 0, book);
          } else {
            books[index] = book;
          }
          return { ...state, books, saving: false };
        }
        case SAVE_BOOK_SUCCEEDED:
          const books = [...(state.books || [])];
          const book = payload.book;
          if (book._id !== undefined) {
            log("ITEM in Book Provider: " + JSON.stringify(book));
            const index = books.findIndex((it) => it._id === book._id);
            if (index === -1) {
              books.splice(0, 0, book);
            } else {
              books[index] = book;
            }
            return { ...state, books, saving: false };
          }
          return { ...state, books };
        case SAVE_BOOK_FAILED:
          return { ...state, savingError: payload.error, saving: false };
        case DELETE_BOOK_STARTED:
          return { ...state, deletingError: null, deleting: true }
        case DELETE_BOOK_SUCCEEDED: {
          const books = [...(state.books || [])]
          const book = payload.book
          const index = books.findIndex(it => it._id === book._id)
          books.splice(index, 1)
          return { ...state, books, deleting: false }
        }
        case DELETE_BOOK_FAILED: {
          return { ...state, deletingError: payload.error, deleting: false }
        }
        case CONFLICT: {
          log("CONFLICT: " + JSON.stringify(payload.book));
          return { ...state, oldBook: payload.book };
        }
        case CONFLICT_SOLVED: {
          log("CONFLICT_SOLVED");
          return { ...state, oldBook: undefined };
        }
        default:
          return state;
      }
    };

export const BookContext = React.createContext<BooksState>(initialState);

interface BookProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const BookProvider: React.FC<BookProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { books, fetching, fetchingError, saving, savingError, deleting, deletingError, oldBook } = state;
  useEffect(getBooksEffect, [token]);
  useEffect(wsEffect, [token]);
  const saveBook = useCallback<SaveBookFn>(saveBookCallback, [token]);
  const deleteBook = useCallback<DeleteBookFn>(deleteBookCallback, [token]);
  const updateServer = useCallback<UpdateServerFn>(updateServerCallback, [token])
  const getServerItem = useCallback<ServerItem>(itemServer, [token])
  const value = { books, fetching, fetchingError, saving, savingError, saveBook, deleting, deleteBook, deletingError, updateServer, getServerItem, oldBook };
  log('returns');
  return (
      <BookContext.Provider value={value}>
        {children}
      </BookContext.Provider>
  );

  async function itemServer(id: string, version: number) {
    const oldBook = await getBook(token, id);
    if (oldBook.version !== version)
      dispatch({ type: CONFLICT, payload: { book: oldBook } });
  }

  async function updateServerCallback() {
    const allKeys = Storage.keys()
    let promisedItems;
    var i;

    promisedItems = await allKeys.then(function (allKeys) {
      const promises = [];
      for (i = 0; i < allKeys.keys.length; i++) {
        const promiseItem = Storage.get({ key: allKeys.keys[i] });

        promises.push(promiseItem);
      }
      return promises;
    });

    for (i = 0; i < promisedItems.length; i++) {
      const promise = promisedItems[i];
      const book = await promise.then(function (it) {
        var object; // TODO: extracted var from try scope
        try {
          object = JSON.parse(it.value!);
        } catch (e) {
          return null;
        }
        return object;
      });
      log("BOOK: " + JSON.stringify(book));
      if (book !== null) {
        if (book.status === 1) {
          dispatch({ type: DELETE_BOOK_SUCCEEDED, payload: { book: book } });
          await Storage.remove({ key: book._id });
          const oldBook = book;
          delete oldBook._id;
          oldBook.status = 0;
          const newBook = await createBook(token, oldBook);
          dispatch({ type: SAVE_BOOK_SUCCEEDED, payload: { book: newBook } });
          await Storage.set({
            key: JSON.stringify(newBook._id),
            value: JSON.stringify(newBook),
          });
        } else if (book.status === 2) {
          book.status = 0;
          const newBook = await updateBook(token, book);
          dispatch({ type: SAVE_BOOK_SUCCEEDED, payload: { book: newBook } });
          await Storage.set({
            key: JSON.stringify(newBook._id),
            value: JSON.stringify(newBook),
          });
        } else if (book.status === 3) {
          book.status = 0;
          await deleteBookApi(token, book);
          await Storage.remove({ key: book._id });
        }
      }
    }
  }

  function getBooksEffect() {
    let canceled = false;
    fetchBooks();
    return () => {
      canceled = true;
    }

    async function fetchBooks() {
      if (!token?.trim()) {
        return;
      }
      try {
        log('fetchBooks started');
        dispatch({ type: FETCH_BOOKS_STARTED });
        const books = await getBooks(token);
        log('fetchBooks succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_BOOKS_SUCCEEDED, payload: { books } });
        }
      } catch (error) {
        const allKeys = Storage.keys();
        console.log(allKeys);
        let promisedItems;
        var i;

        promisedItems = await allKeys.then(function (allKeys) {
          // local storage also storages the login token, therefore we must get only Plant objects

          const promises = [];
          for (i = 0; i < allKeys.keys.length; i++) {
            const promiseItem = Storage.get({ key: allKeys.keys[i] });

            promises.push(promiseItem);
          }
          return promises;
        });

        const books = [];
        for (i = 0; i < promisedItems.length; i++) {
          const promise = promisedItems[i];
          const plant = await promise.then(function (it) {
            var object; // TODO: extracted var from try scope
            try {
              object = JSON.parse(it.value!);
            } catch (e) {
              return null;
            }
            console.log(typeof object);
            console.log(object);
            if (object.status !== 2) {
              return object;
            }
            return null;
          });
          if (plant != null) {
            books.push(plant);
          }
        }
        dispatch({ type: FETCH_BOOKS_SUCCEEDED, payload: { books: books } });
      }
    }
  }


  function random_id() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }

  async function saveBookCallback(book: BookProps, connected: boolean) {
    try {
      if (!connected) {
        throw new Error()
      }

      log('saveBook started');
      dispatch({ type: SAVE_BOOK_STARTED });
      const savedBook = await (book._id ? updateBook(token, book) : createBook(token, book));
      log('saveBook succeeded');
      dispatch({ type: SAVE_BOOK_SUCCEEDED, payload: { book: savedBook } });
      dispatch({ type: CONFLICT_SOLVED })
    } catch (error) {
      log('saveBook failed with error: ' + error);
      if (book._id === undefined) {
        book._id = random_id();
        book.status = 1;
        alert("Book saved locally");
      } else {
        book.status = 2;
        alert("Book updated locally");
      }
      await Storage.set({
        key: book._id,
        value: JSON.stringify(book),
      });

      dispatch({ type: SAVE_BOOK_SUCCEEDED_OFFLINE, payload: { book: book } });
      // dispatch({ type: SAVE_BOOK_FAILED, payload: { error } });
    }
  }

  async function deleteBookCallback(book: BookProps, connected: boolean) {
    try {
      if (!connected) {
        throw new Error()
      }
      log("delete started");
      dispatch({ type: DELETE_BOOK_STARTED });
      const deletedBook = await deleteBookApi(token, book);
      log("delete succeeded");
      console.log(deletedBook);
      dispatch({ type: DELETE_BOOK_SUCCEEDED, payload: { book: book } });
    } catch (error) {
      book.status = 3;
      await Storage.set({
        key: JSON.stringify(book._id),
        value: JSON.stringify(book),
      });
      alert("Book deleted locally");
      dispatch({ type: DELETE_BOOK_SUCCEEDED, payload: { book: book } });
      // log("delete failed");
      // dispatch({ type: DELETE_BOOK_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: book } = message;
        log(`ws message, book ${type}`);
        if (type === 'created' || type === 'updated') {
          dispatch({ type: SAVE_BOOK_SUCCEEDED, payload: { book } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};