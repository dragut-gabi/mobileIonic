import { useState } from 'react';
import { getLogger } from '../core';

const log = getLogger('useItems');

export interface ItemProps {
  id?: string;
  text: string;
}

export interface ItemsProps {
  items: ItemProps[],
  addItem: () => void,
}

export const useItems: () => ItemsProps = () => {
  const [items, setItems] = useState([
    { id: '1', text: 'Learn React' },
    { id: '2', text: 'Learn Ionic' }
  ]);
  const addItem = () => {
    const id = `${items.length + 1}`;
    log('addItem');
    setItems(items.concat({ id, text: `New item ${id}` }));
  };
  log('returns');
  return {
    items,
    addItem,
  };
};
