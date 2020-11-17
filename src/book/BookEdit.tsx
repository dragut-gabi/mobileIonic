import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons, IonCheckbox,
  IonContent, IonDatetime,
  IonHeader,
  IonInput, IonItem, IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './BookProvider';
import { RouteComponentProps } from 'react-router';
import { BookProps } from './BookProps';

const log = getLogger('BookEdit');

interface ItemEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const BookEdit: React.FC<ItemEditProps> = ({ history, match }) => {
  const { items, saving, savingError, saveItem,deleteItem } = useContext(ItemContext);
  const [title, setTitle] = useState('');
  const [pages,setPages] = useState(0);
  const [sold,setSold]=useState(false);
  const [releaseDate,setReleaseDate]=useState('');
  const [item, setItem] = useState<BookProps>();
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = items?.find(it => it._id === routeId);
    setItem(item);
    if (item) {
      setTitle(item.title);
      setPages(item.pages);
      setSold(item.sold);
      setReleaseDate(item.releaseDate);
    }
  }, [match.params.id, items]);
  const handleSave = () => {
    const editedItem = item ? { ...item, title,pages,sold,releaseDate } : { title,pages,sold,releaseDate };
    saveItem && saveItem(editedItem).then(() => history.goBack());
  };
  const handleDelete = () =>{
    const editedItem = item ?{...item,title,pages,sold,releaseDate}:{title,pages,sold,releaseDate}
    deleteItem && deleteItem(editedItem).then(()=>history.goBack())
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
          <IonInput value={title} onIonChange={e=>setTitle(e.detail.value||'')}/>
        </IonItem>
        <IonItem>
          <IonLabel>Pages: </IonLabel>
          <IonInput value={pages} onIonChange={e=>setPages(Number(e.detail.value))}/>
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
          <IonDatetime value={releaseDate} onIonChange={e => setReleaseDate(e.detail.value?.split("T")[0]!)}/>
        </IonItem>
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default BookEdit;
