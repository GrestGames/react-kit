export class Tracker<T> {

    private ids: number = 0;
    private listeners: Map<number, ((id: T | undefined, operation: TrackerOperation) => void)> = new Map()

    public listen(tracker: (id: T | undefined, operation: TrackerOperation) => void): () => void {
        const id = this.ids++;
        this.listeners.set(id, tracker);
        return () => {
            this.listeners.delete(id);
        };
    }

    public listenForEffect(tracker: (id: T | undefined, operation: TrackerOperation) => void) {
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
     * Notify listeners that the tracked set changed in a way no single id
     * describes — the "something happened, re-read the list" ping.
     */
    public refresh() {
        this.listeners?.forEach((e) => e(undefined, TrackerOperation.RELOAD))
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
    DELETE = "delete",
    /** From `refresh()`: the set changed, but no one id describes how. Carries no id. */
    RELOAD = "reload"
}