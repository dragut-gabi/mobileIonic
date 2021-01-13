import React, {useState} from 'react';
import { IonItem, IonLabel, IonModal, createAnimation, IonButton } from '@ionic/react';
import { BookProps } from './BookProps';

interface BookPropsExt extends BookProps {
    onEdit: (_id?: string) => void;
}

const Book: React.FC<BookPropsExt> = ({ _id, title, onEdit, photoPath }) => {
    const [showModal,setShowModal] = useState(false)
    const enterAnimation = (baseE1:any)=>{
        const backdropAnimation = createAnimation()
            .addElement(baseE1.querySelector("ion-backdrop")!)
            .fromTo("opacity", "0.01","var(--backdrop-opacity)")

        const wrapperAnimation = createAnimation()
            .addElement(baseE1.querySelector(".modal-wrapper")!)
            .keyframes([
                {offset: 0, opacity: "0", trasform: "scale(0)"},
                {offset:1, opacity: "0.99", trasform: "scale(1)"},
            ])
        return createAnimation()
            .addElement(baseE1)
            .easing("ease-out")
            .duration(500)
            .addAnimation([backdropAnimation,wrapperAnimation])
    }

    const leaveAnimation = (baseE1:any)=>{
        return enterAnimation(baseE1).direction("reverse")
    }
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel onClick={()=> onEdit(_id)}>{title}</IonLabel>
            <img src={photoPath}
                 style={{height: 50}}
                onClick={()=>{
                    setShowModal(true)
                }}
            />
            <IonModal
                isOpen={showModal}
                enterAnimation={enterAnimation}
                leaveAnimation={leaveAnimation}
            >
                <img src={photoPath} />
                <IonButton onClick={() => setShowModal(false)}>Close Modal</IonButton>
            </IonModal>
        </IonItem>

    );
};

export default Book;