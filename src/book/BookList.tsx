import React, { useContext, useState, useEffect } from 'react';
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
  IonSearchbar,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Book from './Book';
import { getLogger } from '../core';
import { BookContext } from './BookProvider';
import { AuthContext } from '../auth';
import { BookProps } from './BookProps';


const log = getLogger('BookList');

const BookList: React.FC<RouteComponentProps> = ({ history }) => {
  const { books, fetching, fetchingError } = useContext(BookContext);
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(
      false
  );
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [pos, setPos] = useState(3);
  const selectOptions = ["sold", "not sold"];
  const [booksShow, setBooksShow] = useState<BookProps[]>([]);
  const { logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout?.();
    return <Redirect to={{ pathname: "/login" }} />;
  };
  useEffect(() => {
    if (books?.length) {
      setBooksShow(books.slice(0, 3));
    }
  }, [books]);
  log("render");
  async function searchNext($event: CustomEvent<void>) {
    if (books && pos < books.length) {
      setBooksShow([...booksShow, ...books.slice(pos, 3 + pos)]);
      setPos(pos + 3);
    } else {
      setDisableInfiniteScroll(true);
    }
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

  useEffect(() => {
    if (filter && books) {
      const boolType = filter === "sold";
      setBooksShow(books.filter((book) => book.sold == boolType));
    }
  }, [filter]);

  useEffect(() => {
    if (!search && books) {
      setBooksShow(books)
    }
    else if (search && books) {
      setBooksShow(books.filter((book) => book.title.toLowerCase().includes(search)));
    }
  }, [search]);
  return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Book List</IonTitle>
            <IonButton onClick={handleLogout}>Logout</IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonLoading isOpen={fetching} message="Fetching books" />
          <IonSearchbar
              value={search}
              debounce={1000}
              onIonChange={(e) => setSearch(e.detail.value!)}
          ></IonSearchbar>
          <IonSelect
              value={filter}
              placeholder="Select sold status"
              onIonChange={(e) => setFilter(e.detail.value)}
          >
            {selectOptions.map((option) => (
                <IonSelectOption key={option} value={option}>
                  {option}
                </IonSelectOption>
            ))}
          </IonSelect>
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
                    onEdit={(id) => history.push(`/book/${id}`)}
                />
            );
          })}
          <IonInfiniteScroll
              threshold="100px"
              disabled={disableInfiniteScroll}
              onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}
          >
            <IonInfiniteScrollContent loadingText="Loading more books..."></IonInfiniteScrollContent>
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