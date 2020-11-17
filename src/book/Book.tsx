import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { BookProps } from './BookProps';

interface ItemPropsExt extends BookProps {
  onEdit: (_id?: string) => void;
}

const Book: React.FC<ItemPropsExt> = ({ _id, title, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(_id)}>
      <IonLabel>{title}</IonLabel>
    </IonItem>
  );
};

export default Book;