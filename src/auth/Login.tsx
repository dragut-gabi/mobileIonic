import React, { useContext } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';

const log = getLogger('Login');

export const Login: React.FC<RouteComponentProps> = ({ history}) => {
  const { login } = useContext(AuthContext);
  const handleLogin = () => {
    log('handleLogin...');
    login?.().then(() => {
      log('handleLogin, redirect to home');
      history.replace('/');
    });
  };
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton onClick={handleLogin}>Login</IonButton>
      </IonContent>
    </IonPage>
  );
};
