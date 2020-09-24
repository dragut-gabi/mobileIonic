import React from 'react';
import { ItemProps } from './useItems';

const Item: React.FC<ItemProps> = ({ id, text }) => {
  return (
    <div>{text}</div>
  );
};

export default Item;
