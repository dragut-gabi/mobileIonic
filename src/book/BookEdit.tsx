import React, { useContext, useEffect, useState } from 'react';
import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonDatetime, IonFab, IonFabButton,
  IonHeader, IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { camera, trash, close } from "ionicons/icons";
import { getLogger } from '../core';
import { BookContext } from './BookProvider';
import { RouteComponentProps } from 'react-router';
import { BookProps } from './BookProps';
import { useNetwork } from "../utils/useNetwork";
import { Photo, usePhotoGallery } from "../utils/usePhotoGallery";
import { PhotoViewer } from "@ionic-native/photo-viewer";
import { MyMap } from "../utils/MyMap";

const log = getLogger('ItemEdit');
function mapLog(source: string){
  return (e:any) => console.log(source, e.latLng.lat(), e.latLng.lng());
}

interface BookEditProps extends RouteComponentProps<{
  id?: string;
}> { }

const BookEdit: React.FC<BookEditProps> = ({ history, match }) => {
  const { books, saving, savingError, saveBook, deleteBook, getServerItem, oldBook } = useContext(BookContext);
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState(0);
  const [sold, setSold] = useState(false)
  const [releaseDate, setReleaseDate] = useState('')
  const [photoPath, setPhotoPath] = useState("");
  const [latitude, setLatitude] = useState(46.7533824);
  const [longitude, setLongitude] = useState(23.5831296);
  const [book, setBook] = useState<BookProps>();
  const [bookV2, setBookV2] = useState<BookProps>()
  const {networkStatus}=useNetwork();

  const { photos, takePhoto, deletePhoto } = usePhotoGallery();
  const [photoToDelete, setPhotoToDelete] = useState<Photo>();

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
      setPhotoPath(book.photoPath);
      if (book.latitude) setLatitude(book.latitude);
      if (book.longitude) setLongitude(book.longitude);
      getServerItem && getServerItem(match.params.id!, book?.version)
    }
  }, [match.params.id, books, getServerItem]);

  useEffect(() => {
    setBookV2(oldBook)
    log('SET OLD BOOK: ' + JSON.stringify(oldBook))
  },[oldBook])

  const handleSave = () => {
    const editedBook = book ? { ...book, title, pages, sold, releaseDate, status: 0, version: book.version ? book.version + 1 : 1, photoPath, latitude, longitude } : { title, pages, sold, releaseDate, status: 0, version: 1, photoPath, latitude, longitude };
    saveBook && saveBook(editedBook, networkStatus.connected).then(() => {
      log(JSON.stringify(bookV2))
      if (bookV2 === undefined) history.goBack()
    })
  }

  const handleDelete = () => {
    const deletedBook = book ? { ...book, title, pages, sold, releaseDate, status: 0, version: 0, photoPath, latitude, longitude } : { title, pages, sold, releaseDate, status: 0, version: 0, photoPath, latitude, longitude }
    deleteBook && deleteBook(deletedBook, networkStatus.connected).then(() => history.goBack())
  }

  const setMapPosition = (e: any) => {
    setLatitude(e.latLng.lat());
    setLongitude(e.latLng.lng());
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
        photoPath,
        latitude,
        longitude
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
        photoPath,
        latitude,
        longitude
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
          <img src={photoPath} />
          <MyMap
              lat={latitude}
              lng={longitude}
              onMapClick={setMapPosition
                /*(location: any) => {
                setLatitude(location.latLng.lat());
                setLongitude(location.latLng.lng());
              }*/}
              onMarkerClick={mapLog('onMarker')}
          />
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
          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            <IonFabButton
                onClick={() => {
                  const photoTaken = takePhoto();
                  photoTaken.then((data) => {
                    setPhotoPath(data.webviewPath!);
                  });
                }}
            >
              <IonIcon icon={camera} />
            </IonFabButton>
          </IonFab>
          <IonActionSheet
              isOpen={!!photoToDelete}
              buttons={[
                {
                  text: "Delete",
                  role: "destructive",
                  icon: trash,
                  handler: () => {
                    if (photoToDelete) {
                      deletePhoto(photoToDelete);
                      setPhotoToDelete(undefined);
                    }
                  },
                },
                {
                  text: "Cancel",
                  icon: close,
                  role: "cancel",
                },
              ]}
              onDidDismiss={() => setPhotoToDelete(undefined)}
          />
        </IonContent>
      </IonPage>
  );
};

export default BookEdit;