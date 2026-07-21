export class Tracker<T> {

    private ids: number = 0;
    private listeners: Map<number, ((id: T, operation: TrackerOperation) => void)> = new Map()

    public listen(tracker: (id: T, operation: TrackerOperation) => void): () => void {
        const id = this.ids++;
        this.listeners.set(id, tracker);
        return () => {
            this.listeners.delete(id);
        };
    }

    public listenForEffect(tracker: (id: T, operation: TrackerOperation) => void) {
        return () => {
            return this.listen(tracker);
        }
    }


    /**
     * Convenience method that uses
     *  - update if inputId is set
     *  - create if inputId is undefined
     */
    public sync(inputId: T, resultId: T) {
        if (inputId) {
            this.update(inputId);
        } else {
            this.create(resultId);
        }
    }

    /**
     * Notify listeners that the tracked set changed without a meaningful id —
     * the "something happened, reload the list" ping. Listeners that key off the
     * id get undefined; those that just re-fetch (the common case) ignore it.
     */
    public refresh() {
        this.listeners?.forEach((e) => e(undefined as T, TrackerOperation.UPDATE))
    }

    public update(id: T) {
        this.listeners?.forEach((e) => e(id, TrackerOperation.UPDATE))
    }

    public create(id: T) {
        this.listeners?.forEach((e) => e(id, TrackerOperation.CREATE))
    }

    public delete(id: T) {
        this.listeners?.forEach((e) => e(id, TrackerOperation.DELETE))
    }
}

export enum TrackerOperation {
    UPDATE = "update",
    CREATE = "create",
    DELETE = "delete"
}