export class DomainStoryIdFactory {
    getId(type: string) {
        return this.generateId(type);
    }

    registerId(id: string) {
        idList.push(id);
    }

    private generateId(type: string) {
        let idNumber = this.fourDigitsId();

        let id = `${type}_${this.idSuffix(idNumber)}`;

        while (containsId(id)) {
            idNumber += 1;
            id = `${type}_${this.idSuffix(idNumber)}`;
        }

        idList.push(id);

        return id;
    }

    private fourDigitsId() {
        return Math.floor(Math.random() * 10000);
    }

    private idSuffix(idNumber: number) {
        let id;
        if (idNumber > 9999) {
            id = "0";
        } else if (idNumber < 10) {
            id = "000" + idNumber;
        } else if (idNumber < 100) {
            id = "00" + idNumber;
        } else if (idNumber < 1000) {
            id = "0" + idNumber;
        } else {
            id = "" + idNumber;
        }
        return id;
    }
}

export function containsId(id: string) {
    let same = false;
    idList.forEach((element) => {
        if (id === element) {
            same = true;
        }
    });
    return same;
}

const idList: string[] = [];
