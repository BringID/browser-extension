import {NotarizationStatus, NotarizationState, NotarizationHandler} from "./types";
import {Result} from "../../../common/types";
import {tasks, Task} from "../../../common/core";
import {NotarizationXProfile} from "./handlers/x-profile";
import {NotarizationUberRides} from "./handlers/uber-rides";

// NotarizationManager stores Notarization and handles Redux
export class NotarizationManager {
    readonly #notarizations: NotarizationHandler[] = [];
    #currentNotarization: NotarizationHandler | null = null;

    constructor(notarizations: NotarizationHandler[]) {
        this.#notarizations = notarizations;
    }

    async run(id: number): Promise<void> {
        if (this.#currentNotarization && this.#currentNotarization.state.status === NotarizationStatus.InProgress) {
            await this.#currentNotarization.stop();
        }
        this.#currentNotarization = this.#notarizations[id];
        await this.#currentNotarization.start(
            (res) => console.log("Notarization Manager: Start returned. This should be handled properly. See TODO.", res), // TODO Result Handler
            this.notificationHandler.bind(this)
        );
    }

    notificationHandler(state: NotarizationState) {
        console.log("State updated:", state);
    }
}

const t: Task[] = tasks();
export const notarizationManager = new NotarizationManager([
    new NotarizationXProfile(t[0]),
    new NotarizationUberRides(t[1]),
]);