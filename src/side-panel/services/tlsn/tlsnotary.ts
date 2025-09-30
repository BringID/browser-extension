import {
    Commit,
    NotaryServer,
    Prover as TProver,
    Presentation as TPresentation
} from "tlsn-js";
import {Status, Transcript} from "./types";
import {Progressive, OnStateUpdated} from "../../common/helpers/progressive";
import * as Comlink from 'comlink';
import {Result} from "../../../common/types";
import {Request} from "../../common/types";
import {ParsedHTTPMessage, parseHttpMessage} from "../../common/helpers/httpParser";
import { WsMonitorConfig } from './worker';
import { TProgressData } from "../../types";
import { store } from '../../store';
import { notarizationSlice } from '../../store/notarization';

const worker = new Worker(new URL('./worker.ts', import.meta.url))
worker.postMessage({
  action: 'initWsMonitor',
});

worker.onmessage = (event: MessageEvent<{type: string, payload: TProgressData}>) => {
  console.log("WORKER: ", event.data);

  if (!event.data) { return }
  const {
    payload
  } = event.data

  if (!payload) { return }

  const {
    progress,
    etaSeconds,
    quality,
    speed
  } = payload

  store.dispatch(notarizationSlice.actions.setProgressData({
    progress,
    eta: etaSeconds,
    connectionQuality: quality,
    speed
  }));
};

// tlsn-js doesn't provide a valid Comlink API type
// @ts-ignore
const { init, Prover, Presentation }: any = Comlink.wrap(worker);
void init({loggingLevel: "Debug"});

export class TLSNotary extends Progressive<Status>{
    readonly #notary = new NotaryServer(process.env.NOTARY_URL || "");
    readonly #proxyURL = process.env.PROXY_URL || "";
    readonly #prover: TProver;

   static async new(
    tlsnConfig: {serverDns: string, maxSentData: number, maxRecvData: number},
    wsMonitorConfig: WsMonitorConfig,
    updatesCallback?: OnStateUpdated<Status>,
  ): Promise<TLSNotary> {
     worker.postMessage({
       action: 'setWsMonitorConfig',
       wsMonitorConfig
     });
    const prover = (await new Prover(tlsnConfig)) as TProver;
    return new TLSNotary(tlsnConfig.serverDns, prover, updatesCallback);
  }

    private constructor(
    hostname: string,
    prover: TProver,
    updatesCallback?: OnStateUpdated<Status>,
  ) {
    super({ progress: 0, status: Status.Idle }, updatesCallback);
    this.#proxyURL = `${this.#proxyURL}?token=${hostname}`;
    this.#prover = prover;
    console.log('start notary: ', this.#proxyURL, this.#notary);
  }

    async transcript(
        request: Request
    ): Promise<Result<[Transcript, ParsedHTTPMessage]>> {
        if (this.state.status === Status.InProgress) return new Error("Notarization is in progress");
        await this.#prover.setup(await this.#notary.sessionUrl());
        const resp = await this.#prover.sendRequest(this.#proxyURL, {
            url: request.url,
            method: request.method,
            headers: request.headers,
            body: request.body,
        });
        if(resp.status !== 200) return new Error(`Notarization failed with status ${resp.status}`);
        const transcript = await this.#prover.transcript();
        const parsedHttpMessage = parseHttpMessage(Buffer.from(transcript.recv), "RESPONSE");
        if(parsedHttpMessage instanceof Error) return parsedHttpMessage;

        this.setStatus(Status.Idle);
        return [transcript, parsedHttpMessage];
    }

    async notarize(commit: Commit): Promise<Result<TPresentation>> {
        if (this.state.status === Status.InProgress) return new Error("Notarization is in progress");

        const notarizationOutputs = await this.#prover.notarize(commit);
        const presentation = await new Presentation({
            attestationHex: notarizationOutputs.attestation,
            secretsHex: notarizationOutputs.secrets,
            notaryUrl: notarizationOutputs.notaryUrl,
            websocketProxyUrl: notarizationOutputs.websocketProxyUrl,
            reveal: { ...commit, server_identity: false },
        }) as TPresentation;

        this.setStatus(Status.Idle);
        return presentation;
    }
}