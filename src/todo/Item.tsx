import React from 'react';

interface ItemProps {
    id?: string;
    text: string;
}

const Item: React.FC<ItemProps> = ({ id, text }) => {
  return (
    <div>{text}</div>
  );
};

export default Item;
