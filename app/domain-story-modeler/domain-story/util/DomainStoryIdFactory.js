
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
  return Math.floor(Math.random() * (9999 - 0 + 1)) + 0;
}

function containsId(id) {
  idList.forEach(element => {
    if (id == element) {
      return true;
    }
  });
  return false;
}