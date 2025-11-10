# Custom Notarization Handlers Guide

This guide explains how to create custom notarization handlers that extend the `NotarizationBase` class to implement domain-specific notarization workflows.

## Overview

Notarization handlers are responsible for managing the complete notarization workflow. They can perform virtually any actions needed for their specific use case. While most handlers (99.9% of cases) will typically:

1. Record specific HTTP requests from web pages
2. Create cryptographic proofs (notarizations) of those requests using TLSNotary
3. Manage the notarization lifecycle and progress reporting
4. Implement partial data reveal through commitments

The handlers have complete flexibility to implement custom logic, interact with different APIs, perform data processing, or execute any other operations required for their specific notarization scenario.

## Architecture

### Base Class: NotarizationBase

All notarization handlers extend [`NotarizationBase`](notarization-base.ts), which provides:

#### Protected Methods Available:

- `setProgress(progress: number)` - Update progress (0-100)
- `setStatus(status: NotarizationStatus)` - Update status
- `setError(error: Error)` - Set error state
- `result(res: Result<Presentation>)` - Complete notarization with result

#### Abstract Methods to Implement:

- `onStart(): Promise<void>` - Called when notarization starts
- `onStop(): Promise<void>` - Called when notarization stops (aborted)

### Key Dependencies

1. **RequestRecorder** ([`request-recorder.ts`](../requests-recorder/request-recorder.ts))
   - Captures HTTP requests matching specified patterns
   - Provides filtered request logs for notarization

2. **TLSNotary** ([`tlsnotary.ts`](../tlsn/tlsnotary.ts))
   - Creates cryptographic proofs of HTTP requests
   - Generates transcripts and presentations

## Creating a Custom Handler

### Step 1: Basic Handler Structure

```typescript
import { NotarizationBase } from '../notarization-base';

export class NotarizationMyService extends NotarizationBase {
  public async onStart(): Promise<void> {
    // Implementation here
  }

  public async onStop(): Promise<void> {
    // Implementation here
  }
}
```

### Step 2: Adding Request Recording (Optional)

Most handlers will need to capture HTTP requests. The `RequestRecorder` constructor takes:

- `targetRequests`: Array of request patterns to capture
- `successCallback`: Function called when all target requests are captured

```typescript
import { NotarizationBase } from '../notarization-base';
import { RequestRecorder } from '../../requests-recorder';
import { Request } from '../../../common/types';

export class NotarizationMyService extends NotarizationBase {
  requestRecorder: RequestRecorder = new RequestRecorder(
    [
      { method: 'GET', urlPattern: 'https://api.myservice.com/user/*' },
      { method: 'POST', urlPattern: 'https://api.myservice.com/data*' },
    ],
    this.onRequestsCaptured.bind(this),
  );

  public async onStart(): Promise<void> {
    // Implementation here
  }

  public async onStop(): Promise<void> {
    // Implementation here
  }

  private async onRequestsCaptured(log: Array<Request>) {
    // Implementation here
  }
}
```

**URL Pattern Matching:**

- Use `*` as wildcard for any characters
- Exact matches without wildcards are supported
- Patterns are converted to regex internally

**⚠️ IMPORTANT - Request Log Ordering:**
The callback receives a log array where `log[0]` corresponds to the first request pattern in the constructor, `log[1]` to the second pattern, etc. This ordering is guaranteed and maintained by the `RequestRecorder` implementation, regardless of when the requests actually occur.

### Step 3: Example Implementation of onStart()

Here's an example of how you might implement the `onStart()` method:

```typescript
public async onStart(): Promise<void> {
    // Start request recording
    this.requestRecorder.start();

    // Navigate to the target page
    await chrome.tabs.create({ url: "https://myservice.com/profile" });

    // Update progress
    this.setProgress(30);
}
```

### Step 4: Example Implementation of onStop()

Here's an example of how you might implement the `onStop()` method:

```typescript
public async onStop(): Promise<void> {
    // Stop request recording
    this.requestRecorder.stop();
}
```

### Step 5: Example Request Processing

Here's an example of how you might process captured requests:

```typescript
private async onRequestsCaptured(log: Array<Request>) {
    this.setProgress(60);

    try {
        // Create TLSNotary instance for the target hostname
        const notary = await TLSNotary.new("api.myservice.com");

        // Generate transcript
        const result = await notary.transcript(log[0]);
        if (result instanceof Error) {
            this.result(result);
            return;
        }

        const [transcript, parsedResponse] = result;

        // Create commitment for partial data reveal
        const commit: Commit = {
            sent: [{ start: 0, end: transcript.sent.length }],
            recv: [{ start: 0, end: Math.floor(transcript.recv.length / 2) }]
        };

        // Generate final notarization
        const presentation = await notary.notarize(commit);
        this.result(presentation);

    } catch (error) {
        this.result(new Error(`Notarization failed: ${error.message}`));
    }
}
```

## Progress Updates

Handlers should provide progress updates to inform users about the notarization status. Use the protected methods from [`NotarizationBase`](notarization-base.ts):

### Available Progress Methods

- `setProgress(progress: number)` - Update progress (0-100)
- `setStatus(status: NotarizationStatus)` - Update status (handled automatically by base class)
- `setError(error: Error)` - Set error state

### Progress Update Example

```typescript
public async onStart(): Promise<void> {
    this.setProgress(10); // Starting

    this.requestRecorder.start();
    this.setProgress(30); // Request recording started

    await chrome.tabs.create({ url: "https://example.com" });
    this.setProgress(50); // Navigation complete
}

private async onRequestsCaptured(log: Array<Request>) {
    this.setProgress(70); // Requests captured

    const notary = await TLSNotary.new("api.example.com");
    this.setProgress(80); // TLSNotary initialized

    const result = await notary.transcript(log[0]);
    this.setProgress(90); // Transcript generated

    // Final result call automatically sets progress to 100
    this.result(await notary.notarize(commit));
}
```

## Returning Results

Handlers must call the `result()` method to complete the notarization process.

### Using the result() Method

```typescript
// For successful notarization
const presentation = await notary.notarize(commit);
this.result(presentation);

// For errors
this.result(new Error('Notarization failed: invalid response'));
```

The `result()` method:

- Automatically sets progress to 100% for successful results
- Sets appropriate error state for Error objects
- Updates the notarization status

## Error Handling

Always handle errors appropriately and use the `result()` method to report them:

```typescript
private async onRequestsCaptured(log: Array<Request>) {
    try {
        const notary = await TLSNotary.new("api.example.com");
        const result = await notary.transcript(log[0]);

        if (result instanceof Error) {
            this.result(result);
            return;
        }

        // ... process result

    } catch (error) {
        this.result(new Error(`Processing failed: ${error.message}`));
    }
}
```

## Partial Data Reveal (Commitments)

### What is Partial Data Reveal?

Partial data reveal allows you to prove specific parts of an HTTP request/response while keeping other parts private. This is achieved through cryptographic commitments.

### Commitment Structure

```typescript
const commit: Commit = {
  sent: [{ start: 0, end: transcript.sent.length }], // Reveal entire request
  recv: [{ start: 100, end: 500 }], // Reveal bytes 100-500 of response
};
```

## Complete Example: X Profile Handler

Reference implementation from [`x-profile.ts`](./x-profile.ts):

```typescript
import { NotarizationBase } from '../notarization-base';
import { RequestRecorder } from '../../requests-recorder';
import { Request } from '../../../common/types';
import { TLSNotary } from '../../tlsn';
import { Commit } from 'bringid-tlsn-js';

export class NotarizationXProfile extends NotarizationBase {
  requestRecorder: RequestRecorder = new RequestRecorder(
    [
      {
        method: 'GET',
        urlPattern: 'https://api.x.com/1.1/account/settings.json?*',
      },
    ],
    this.onRequestsCaptured.bind(this),
  );

  public async onStart(): Promise<void> {
    this.requestRecorder.start();
    await chrome.tabs.create({ url: 'https://x.com' });
    this.setProgress(30);
  }

  private async onRequestsCaptured(log: Array<Request>) {
    this.setProgress(60);

    const notary = await TLSNotary.new('api.x.com');
    const result = await notary.transcript(log[0]);

    if (result instanceof Error) {
      this.result(result);
      return;
    }

    const [transcript] = result;

    // Reveal entire request and half of response
    const commit: Commit = {
      sent: [{ start: 0, end: transcript.sent.length }],
      recv: [{ start: 0, end: Math.floor(transcript.recv.length / 2) }],
    };

    this.result(await notary.notarize(commit));
  }

  public async onStop(): Promise<void> {
    this.requestRecorder.stop();
  }
}
```
