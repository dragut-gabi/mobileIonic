import React, { useContext, useState, useEffect } from 'react';
import { createAnimation } from "@ionic/react";
import { RouteComponentProps } from 'react-router';
import { Redirect } from 'react-router-dom';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSelect,
  IonSelectOption,
  IonSearchbar, IonList,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Book from './Book';
import { getLogger } from '../core';
import { BookContext } from './BookProvider';
import { AuthContext } from '../auth';
import { BookProps } from './BookProps';
import {Plugins} from "@capacitor/core";
import {useNetwork} from "../utils/useNetwork";


const log = getLogger('BookList');

const BookList: React.FC<RouteComponentProps> = ({ history }) => {
  const { books, fetching, fetchingError, updateServer } = useContext(BookContext);
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(
      false
  );
  const {networkStatus}=useNetwork();
  const [filter, setFilter] = useState<string | undefined>("all");
  const [search, setSearch] = useState<string>("");
  const [pos, setPos] = useState(9);
  const selectOptions = ["sold", "not sold"];
  const [booksShow, setBooksShow] = useState<BookProps[]>([]);
  const { logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout?.();
    return <Redirect to={{ pathname: "/login" }} />;
  };

  useEffect(() => {
    if (networkStatus.connected === true) {
      updateServer && updateServer()
    }
  }, [networkStatus.connected])

  useEffect(() => {
    if (books?.length) {
      setBooksShow(books.slice(0, 9));

    }
  }, [books]);


  log("render");

  function wait(){
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  async function searchNext($event: CustomEvent<void>) {
    if (books && pos < books.length) {
      console.log(pos,books.length);
      await wait();
      setBooksShow([...booksShow, ...books.slice(pos, 3 + pos)]);
      setPos(pos + 3);
    } else {
      setDisableInfiniteScroll(true);
    }
    await ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

  useEffect(() => {
    if (filter!="all" && books) {
      const boolType = filter === "sold";
      setBooksShow(books.filter((book) => book.sold == boolType).slice(0,9));
    }
    else if(books){
      setBooksShow(books.slice(0,9))
    }
  }, [filter]);

  useEffect(() => {
    if (!search && books) {
      setBooksShow(books.slice(0,9));
      setPos(9)
    }
    else if (search && books) {
      setBooksShow(books.filter((book) => book.title.toLowerCase().includes(search)));
    }
  }, [search]);


  function simpleAnimation() {
    const el = document.querySelector(".networkStatus");
    if (el) {
      const animation = createAnimation()
          .addElement(el)
          .duration(1000)
          .direction("alternate")
          .iterations(Infinity)
          .keyframes([
            { offset: 0, transform: "scale(1)", opacity: "1" },
            {
              offset: 1,
              transform: "scale(0.5)",
              opacity: "0.5",
            },
          ]);
      animation.play();
    }
  }
  useEffect(simpleAnimation, []);
  function groupAnimations() {
    const elB = document.querySelector('.searchBar');
    const elC = document.querySelector('.select');
    if (elB && elC) {
      const animationA = createAnimation()
          .addElement(elB)
          .fromTo('transform', 'scale(1)','scale(0.75)');
      const animationB = createAnimation()
          .addElement(elC)
          .fromTo('transform', 'rotate(0)', 'rotate(180deg)');
      const parentAnimation = createAnimation()
          .duration(10000)
          .addAnimation([animationA, animationB]);
      parentAnimation.play();    }
  }
  useEffect(groupAnimations, []);

  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Book List</IonTitle>
            <IonButton onClick={handleLogout}>Logout</IonButton>
            <div className="networkStatus">
              Network is {networkStatus.connected ? "online" : "offline"}
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonLoading isOpen={fetching} message="Fetching books" />
          <div className="searchBar">
          <IonSearchbar
            value={search}
            debounce={1000}
            onIonChange={(e) => setSearch(e.detail.value!)}
          />
          </div>
          <div className="select">
          <IonSelect
              value={filter}
              placeholder="Select sold status"
              onIonChange={(e) => setFilter(e.detail.value)}
          >
            {selectOptions.map((option) => (
                <IonSelectOption key={option} value={option}>
                  {option}
                </IonSelectOption>
            ))
            }
            <IonSelectOption key={"all"} value={"all"}>{"all"}</IonSelectOption>
          </IonSelect>
          </div>

          {booksShow &&
          booksShow.map((book: BookProps) => {
            return (
                <Book
                    key={book._id}
                    _id={book._id}
                    title={book.title}
                    pages={book.pages}
                    sold={book.sold}
                    releaseDate={book.releaseDate}
                    status = {book.status}
                    version = {book.version}
                    photoPath={book.photoPath}
                    latitude={book.latitude}
                    longitude={book.longitude}
                    onEdit={(id) => history.push(`/book/${id}`)}
                />
            );
          })}
          <IonInfiniteScroll
              threshold="100px"
              disabled={disableInfiniteScroll}
              onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}
          >
            <IonInfiniteScrollContent loadingSpinner="bubbles" loadingText="Loading more books..."/>
          </IonInfiniteScroll>
          {fetchingError && (
              <div>{fetchingError.message || "Failed to fetch books"}</div>
          )}
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => history.push("/book")}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        </IonContent>
      </IonPage>
  );
};

export default BookList;