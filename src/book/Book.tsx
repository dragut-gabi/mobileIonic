import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { BookProps } from './BookProps';

interface BookPropsExt extends BookProps {
    onEdit: (_id?: string) => void;
}

const Book: React.FC<BookPropsExt> = ({ _id, title, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>{title}</IonLabel>
        </IonItem>
    );
};

export default Book;