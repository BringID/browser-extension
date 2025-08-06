import {Task} from "../../../common/core";
import {Result} from "../../../common/types";

export enum NotarizationStatus {
    NotStarted,
    InProgress,
    Completed,
    Stopped
}

export type NotarizationState = {
    status: NotarizationStatus;
    progress: number;
    error?: Error;
}

export type UpdatesCallback = (state: NotarizationState) => Promise<void> | void;
export type ResultCallback = (presentation: Result<Presentation>) => Promise<void> | void;

export interface NotarizationHandler {
    task: Task;
    state: NotarizationState;
    start: (resultCallback: ResultCallback, updatesCallback?: UpdatesCallback) => Promise<void>;
    stop: () => Promise<void>;
}