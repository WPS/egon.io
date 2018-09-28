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

  var id = type + '_' + fourDigitsId();

  while (containsId(id)) {
    id = type + '_' + fourDigitsId();
  }

  idList.push(id);
  return id;
}

function fourDigitsId() {
  var idNumber= Math.floor(Math.random() * 10000);
  if (idNumber < 10) {
    idNumber= '000' + idNumber;
  }
  else if (idNumber < 100) {
    idNumber = '00' + idNumber;
  }
  else if (idNumber < 1000) {
    idNumber = '0' + idNumber;
  }
  return idNumber;
}

function containsId(id) {
  idList.forEach(element => {
    if (id == element) {
      return true;
    }
  });
  return false;
}