import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { BookProps } from './BookProps';

interface BookPropsExt extends BookProps {
    onEdit: (_id?: string) => void;
}

const Book: React.FC<BookPropsExt> = ({ _id, title, onEdit, photoPath }) => {
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>{title}</IonLabel>
            <img src={photoPath} style={{height: 50}}/>
        </IonItem>
    );
};

export default Book;