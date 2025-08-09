export enum Status {
    Idle = "Idle",
    InProgress = "In Progress",
    Stopped = "Stopped"
}

export type Transcript = {sent: number[], recv: number[]};