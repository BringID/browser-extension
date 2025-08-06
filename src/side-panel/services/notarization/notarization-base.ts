import {Result} from "../../../common/types";
import {Task} from "../../../common/core";
import {NotarizationStatus, NotarizationState, NotarizationHandler, UpdatesCallback, ResultCallback} from "./types";

export abstract class NotarizationBase implements NotarizationHandler {
    public readonly task: Task;
    #resultCallback?: ResultCallback;
    #updatesCallback?: UpdatesCallback;
    #state: NotarizationState = {
        progress: 0,
        status: NotarizationStatus.NotStarted
    };

    public get state() { return this.#state; }
    protected set state(value: NotarizationState) {
        this.#state = value;
        this.notify()
    }

    constructor(task: Task) {
        this.task = task;
    }

    public async start(resultCallback: ResultCallback, updatesCallback?: UpdatesCallback): Promise<void> {
        if (this.#state.status === NotarizationStatus.InProgress) {
            resultCallback(new Error("Notarization is already running"));
        }
        this.#resultCallback = resultCallback;
        this.#updatesCallback = updatesCallback;
        this.#state.status = NotarizationStatus.InProgress;
        this.#state.progress = 0;
        this.#state.error = undefined;
        this.notify();
        void this.onStart();
    }

    public async stop(): Promise<void> {
        this.#state.status = NotarizationStatus.Stopped;
        this.notify();
        return this.onStop();
    };

    private notify() {
        if (this.#updatesCallback) {
            void this.#updatesCallback(this.#state);
        }
    }

    protected result(res: Result<Presentation>) {
        if(res instanceof Error) {
            this.#state.status = NotarizationStatus.Stopped;
            this.#state.error = res;
        } else {
            this.#state.status = NotarizationStatus.Completed;
            this.notify();
            if (this.#resultCallback) {
                void this.#resultCallback(res);
            }
        }
    }

    protected setProgress(progress: number) {
        this.#state.progress = progress;
        this.notify()
    }

    abstract onStart(): Promise<void>;
    abstract onStop(): Promise<void>;
}