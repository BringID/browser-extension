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

// tlsn-js doesn't provide a valid Comlink API type
// @ts-ignore
const { init, Prover, Presentation }: any = Comlink.wrap(
    new Worker(new URL('./worker.ts', import.meta.url)),
);
void init({loggingLevel: "Debug"});

export class TLSNotary extends Progressive<Status>{
    readonly #notary = new NotaryServer(process.env.NOTARY_URL || "");
    readonly #proxyURL = process.env.PROXY_URL || "";
    readonly #prover: TProver;

    static async new(
        hostname: string,
        updatesCallback?: OnStateUpdated<Status>,
    ): Promise<TLSNotary> {
        const prover = (await new Prover({
            serverDns: hostname,
            maxSentData: 4096,
            maxRecvData: 4096,
        })) as TProver;
        return new TLSNotary(prover, updatesCallback);
    }

    private constructor(
        prover: TProver,
        updatesCallback?: OnStateUpdated<Status>,
    ) {
        super({ progress: 0, status: Status.Idle }, updatesCallback);
        this.#prover = prover;
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