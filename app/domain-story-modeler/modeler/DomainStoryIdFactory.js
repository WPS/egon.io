'use strict';

var idList = [];

export default function DomainStoryIdFactory() {
}

DomainStoryIdFactory.prototype.getId = function(type) {
  return generateId(type);
};

DomainStoryIdFactory.prototype.registerId = function(id) {
  idList.push(id);
};

function generateId(type) {

  var idNumber =fourDigitsId();

  var id = type + '_' + idSuffix(idNumber);

  while (containsId(id)) {
    idNumber++;

    id = type + '_' + idSuffix(idNumber);
  }

  idList.push(id);
  return id;
}

function idSuffix(idNumber) {
  var id = '';
  if (idNumber > 9999) {
    id = 0;
  }
  else if (idNumber < 10) {
    id= '000' + idNumber;
  }
  else if (idNumber < 100) {
    id = '00' + idNumber;
  }
  else if (idNumber < 1000) {
    id = '0' + idNumber;
  }
  else {
    id = '' + idNumber;
  }
  return id;
}

function fourDigitsId() {
  var idNumber = Math.floor(Math.random() * 10000);
  return idNumber;
}

function containsId(id) {
  var same = false;
  idList.forEach(element => {
    if (id === element) {
      same = true;
    }
  });
  return same;
}