import React from 'react';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import Item from './Item';
import { getLogger } from '../core';
import { useItems } from './useItems';

const log = getLogger('ItemList');

const ItemList: React.FC = () => {
  const { items, addItem } = useItems();
  log('ItemList render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {items.map(({ id, text}) => <Item key={id} text={text} />)}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={addItem}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default ItemList;
