export type StateStatus = string | number | symbol;

export type State<T extends StateStatus> = {
  status: T;
  progress: number;
  error?: Error;
};

export type OnStateUpdated<T extends StateStatus> = (state: State<T>) => void;

export class Progressive<T extends StateStatus> {
  #state: State<T>;
  #onStateUpdated?: OnStateUpdated<T>;

  constructor(initialState: State<T>, onStateUpdated?: OnStateUpdated<T>) {
    this.#state = initialState;
    this.#onStateUpdated = onStateUpdated;
  }

  private notify() {
    if (this.#onStateUpdated) {
      void this.#onStateUpdated(this.#state);
    }
  }

  public get state() {
    return this.#state;
  }

  protected set state(value: State<T>) {
    this.#state = value;
    this.notify();
  }

  protected set onStateUpdated(callback: OnStateUpdated<T>) {
    this.#onStateUpdated = callback;
  }

  protected setStatus(status: T) {
    this.#state.status = status;
    this.notify();
  }

  protected setProgress(progress: number) {
    this.#state.progress = progress;
    this.notify();
  }

  protected (error: Error) {
    this.#state.error = error;
    this.notify();
  }
}
