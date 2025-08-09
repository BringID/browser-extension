import {HttpMethod} from "./http";
import {JsonValue} from "type-fest";

// A unified type for all requests presented in public APIs
export type Request = {
    url: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body?: JsonValue,
}