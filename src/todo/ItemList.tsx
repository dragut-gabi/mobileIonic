import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import Item from './Item';

const ItemList: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Item text="Learn React" />
        <Item text="Learn Ionic" />
      </IonContent>
    </IonPage>
  );
};

export default ItemList;
