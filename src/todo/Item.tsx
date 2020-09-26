import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { ItemProps } from './ItemProps';

const Item: React.FC<ItemProps> = ({ id, text }) => {
  return (
    <IonItem>
      <IonLabel>{text}</IonLabel>
    </IonItem>
  );
};

export default Item;
