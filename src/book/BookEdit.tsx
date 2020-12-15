import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { BookContext } from './BookProvider';
import { RouteComponentProps } from 'react-router';
import { BookProps } from './BookProps';
import { useNetwork } from "../utils/useNetwork";

const log = getLogger('ItemEdit');

interface BookEditProps extends RouteComponentProps<{
  id?: string;
}> { }

const BookEdit: React.FC<BookEditProps> = ({ history, match }) => {
  const { books, saving, savingError, saveBook, deleteBook, getServerItem, oldBook } = useContext(BookContext);
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState(0);
  const [sold, setSold] = useState(false)
  const [releaseDate, setReleaseDate] = useState('')
  const [book, setBook] = useState<BookProps>();
  const [bookV2, setBookV2] = useState<BookProps>()
  const {networkStatus}=useNetwork();

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const book = books?.find(it => it._id === routeId);
    setBook(book);
    if (book) {
      setTitle(book.title);
      setPages(book.pages);
      setSold(book.sold)
      setReleaseDate(book.releaseDate)
      getServerItem && getServerItem(match.params.id!, book?.version)
    }
  }, [match.params.id, books, getServerItem]);

  useEffect(() => {
    setBookV2(oldBook)
    log('SET OLD BOOK: ' + JSON.stringify(oldBook))
  })

  const handleSave = () => {
    const editedBook = book ? { ...book, title, pages, sold, releaseDate, status: 0, version: book.version ? book.version + 1 : 1 } : { title, pages, sold, releaseDate, status: 0, version: 1 };
    saveBook && saveBook(editedBook, networkStatus.connected).then(() => {
      log(JSON.stringify(bookV2))
      if (bookV2 === undefined) history.goBack()
    })
  }

  const handleDelete = () => {
    const deletedBook = book ? { ...book, title, pages, sold, releaseDate, status: 0, version: 0 } : { title, pages, sold, releaseDate, status: 0, version: 0 }
    deleteBook && deleteBook(deletedBook, networkStatus.connected).then(() => history.goBack())
  }

  const handleConflict1 = () => {
    if (oldBook) {
      const editedBook = {
        ...book,
        title,
        pages,
        sold,
        releaseDate,
        status: 0,
        version: oldBook?.version + 1,
      };
      saveBook &&
      saveBook(editedBook, networkStatus.connected).then(() => {
        history.goBack();
      });
    }
  };
  const handleConflict2 = () => {
    if (oldBook) {
      const editedBook = {
        ...book,
        title: oldBook?.title,
        pages: oldBook?.pages,
        sold: oldBook?.sold,
        releaseDate: oldBook?.releaseDate,
        status: oldBook?.status,
        version: oldBook?.version + 1,
      };
      saveBook &&
      editedBook &&
      saveBook(editedBook, networkStatus.connected).then(() => {
        history.goBack();
      });
    }
  };


  log('render');
  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleSave}>
                Save
              </IonButton>
              <IonButton onClick={handleDelete}>
                Delete
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonItem>
            <IonLabel>Title: </IonLabel>
            <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')} />
          </IonItem>
          <IonItem>
            <IonLabel>Pages: </IonLabel>
            <IonInput value={pages} onIonChange={e => setPages(Number(e.detail.value))} />
          </IonItem>
          <IonItem>
            <IonLabel>Sold: </IonLabel>
            <IonCheckbox
                checked={sold}
                onIonChange={(e) => setSold(e.detail.checked)}
            />
          </IonItem>
          <IonItem>
            <IonLabel>Release Date: </IonLabel>
            <IonDatetime value={releaseDate} onIonChange={e => setReleaseDate(e.detail.value?.split("T")[0]!)}></IonDatetime>
          </IonItem>
          {bookV2 && (
              <>
                <IonItem>
                  <IonLabel>Title: {bookV2.title}</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Pages: {bookV2.pages}</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Sold: </IonLabel>
                  <IonCheckbox checked={bookV2.sold} disabled />
                </IonItem>
                <IonItem>
                  <IonLabel>Release Date: </IonLabel>
                  <IonDatetime value={bookV2.releaseDate} disabled></IonDatetime>
                </IonItem>
                <IonButton onClick={handleConflict1}>First Version</IonButton>
                <IonButton onClick={handleConflict2}>Second Version</IonButton>
              </>
          )}

          <IonLoading isOpen={saving} />
          {savingError && (
              <div>{savingError.message || 'Failed to save book'}</div>
          )}
        </IonContent>
      </IonPage>
  );
};

export default BookEdit;