'use strict';

export const iconSize = 20;

export function setImageElementStyle(imageElement) {
  imageElement.width = iconSize;
  imageElement.height = iconSize;
  imageElement.style.marginLeft = '5px';
}

export function setRadioElementStyle(radioElement) {
  radioElement.id = 'radioButtons';
  radioElement.style.display = 'grid';
  radioElement.style.gridTemplateColumns = '45px 45px 30px';
}

export function setVerticalLineElementStyle(verticalLineElement) {
  verticalLineElement.style.display = 'inline';
  verticalLineElement.style.borderLeft = 'solid 1px black';
  verticalLineElement.width = '1px';
  verticalLineElement.heigth = '15px';
  verticalLineElement.style.overflowY = 'visible';
  verticalLineElement.style.marginLeft = '5px';}

export function setListElementStyle(listElement) {
  listElement.style.marginLeft = '5px';
  listElement.style.height = '20px';
  listElement.style.display = 'grid';
  listElement.style.gridTemplateColumns = '125px 10px 30px auto';
  listElement.style.borderTop = 'solid 1px black';
}