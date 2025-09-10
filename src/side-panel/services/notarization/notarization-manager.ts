import { NotarizationStatus, NotarizationHandler } from './types';
import { tasks, Task } from '../../../common/core';
import { NotarizationXProfile } from './handlers/x-profile';
import { NotarizationUberRides } from './handlers/uber-rides';
import { State } from '../../common/helpers/progressive';
import { Transcript } from 'tlsn-js';
import { notarizationSlice } from '../../store/notarization';
import { store } from '../../store';
import { NotarizationStravaPremium } from './handlers/strava-premium';
import { NotarizationAppleDevices } from './handlers/apple-devices';
import { NotarizationXVerifiedFollowers } from './handlers/x-verified-followers';

// NotarizationManager stores Notarization and handles Redux
export class NotarizationManager {
  readonly #notarizations: NotarizationHandler[] = [];
  #currentNotarization: NotarizationHandler | null = null;

  constructor(notarizations: NotarizationHandler[]) {
    this.#notarizations = notarizations;
  }

  async run(id: number): Promise<void> {
    if (
      this.#currentNotarization &&
      this.#currentNotarization.state.status === NotarizationStatus.InProgress
    ) {
      await this.#currentNotarization.stop();
    }
    store.dispatch(notarizationSlice.actions.setTaskId(id));

    this.#currentNotarization = this.#notarizations[id];

    await this.#currentNotarization.start(
      // TODO Presentation should be passed to popup
      async (res) => {
        if (res instanceof Error) {
          console.error(res);
          return;
        }

        const presentation = await res.json();
        const verifierOutput = await res.verify();
        const transcript = new Transcript({
          sent: verifierOutput.transcript?.sent || [],
          recv: verifierOutput.transcript?.recv || [],
        });

        console.log('Transcript', {
          sent: transcript.sent(),
          recv: transcript.recv(),
        });

        store.dispatch(notarizationSlice.actions.setResult(presentation.data));
      },
      this.notificationHandler.bind(this),
      this.currentStepUpdateHandler.bind(this),
    );
  }

  notificationHandler(state: State<NotarizationStatus>) {
    console.log('State updated:', state);
    store.dispatch(notarizationSlice.actions.setProgress(state.progress));
    //
  }

  currentStepUpdateHandler(currentStep: number) {
    store.dispatch(notarizationSlice.actions.setCurrentStep(currentStep));
  }
}

const t: Task[] = tasks();

export const notarizationManager = new NotarizationManager([
  new NotarizationXProfile(t[0]),
  // new NotarizationUberRides(t[0]),
  // new NotarizationXVerifiedFollowers(t[1]),
  // new NotarizationAppleDevices(t[2]),
]);
