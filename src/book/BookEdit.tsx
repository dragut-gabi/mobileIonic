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

const log = getLogger('ItemEdit');

interface BookEditProps extends RouteComponentProps<{
  id?: string;
}> { }

const BookEdit: React.FC<BookEditProps> = ({ history, match }) => {
  const { books, saving, savingError, saveBook, deleteBook } = useContext(BookContext);
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState(0);
  const [sold, setSold] = useState(false)
  const [releaseDate, setReleaseDate] = useState('')
  const [book, setBook] = useState<BookProps>();
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
    }
  }, [match.params.id, books]);
  const handleSave = () => {
    const editedBook = book ? { ...book, title, pages, sold, releaseDate } : { title, pages, sold, releaseDate };
    saveBook && saveBook(editedBook).then(() => history.goBack());
  };
  const handleDelete = () => {
    const deletedBook = book ? { ...book, title, pages, sold, releaseDate } : { title, pages, sold, releaseDate }
    deleteBook && deleteBook(deletedBook).then(() => history.goBack())
  }
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
          <IonLoading isOpen={saving} />
          {savingError && (
              <div>{savingError.message || 'Failed to save book'}</div>
          )}
        </IonContent>
      </IonPage>
  );
};

export default BookEdit;