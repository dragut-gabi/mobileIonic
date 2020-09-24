import React, { useState } from 'react';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import Item from './Item';
import { getLogger } from '../core';

const log = getLogger('ItemList');

const ItemList: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', text: 'Learn React' },
    { id: '2', text: 'Learn Ionic' }
  ]);
  const addItem = () => {
    const id = `${items.length + 1}`;
    log('ItemList addItem');
    setItems(items.concat({ id, text: `New item ${id}` }));
  };
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
