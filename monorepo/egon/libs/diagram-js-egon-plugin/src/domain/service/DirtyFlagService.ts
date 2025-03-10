import { BehaviorSubject } from "rxjs";

export class DirtyFlagService {
    static $inject: string[] = [];

    private isDirtySubject = new BehaviorSubject<boolean>(false);
    dirty$ = this.isDirtySubject.asObservable();

    get dirty(): boolean {
        return this.isDirtySubject.value;
    }

    makeDirty(): void {
        this.isDirtySubject.next(true);
    }

    makeClean(): void {
        this.isDirtySubject.next(false);
    }
}
