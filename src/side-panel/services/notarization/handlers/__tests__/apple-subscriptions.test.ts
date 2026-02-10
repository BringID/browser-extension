/**
 * Mock-based disclosure testing for Apple Subscriptions handler.
 *
 * Validates that newCommitForRequest correctly computes byte ranges
 * for disclosed JSON paths against synthetic HTTP response transcripts.
 *
 * Run: npx tsx src/side-panel/services/notarization/handlers/__tests__/apple-subscriptions.test.ts
 */

import { newCommitForRequest } from '../../helpers';
import { parseHttpMessage } from '../../../../common/helpers/httpParser';
import { Transcript } from '../../../tlsn/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildHttpResponse(body: string): string {
  return (
    'HTTP/1.1 200 OK\r\n' +
    'Content-Type: application/json\r\n' +
    `Content-Length: ${Buffer.byteLength(body)}\r\n` +
    '\r\n' +
    body
  );
}

function buildTranscript(url: string, method: string, responseStr: string): Transcript {
  const sent = Array.from(Buffer.from(`${method} ${url}`));
  const recv = Array.from(Buffer.from(responseStr));
  return { sent, recv };
}

type TestResult = {
  name: string;
  passed: boolean;
  disclosed: string[];
  errors: string[];
};

function runScenario(
  name: string,
  bodyStr: string,
  url: string,
  expectedFragments: string[],
): TestResult {
  const result: TestResult = { name, passed: true, disclosed: [], errors: [] };

  const responseStr = buildHttpResponse(bodyStr);
  const transcript = buildTranscript(url, 'GET', responseStr);
  const recvBuf = Buffer.from(transcript.recv);

  const parsed = parseHttpMessage(recvBuf, 'RESPONSE');
  if (parsed instanceof Error) {
    result.passed = false;
    result.errors.push(`parseHttpMessage failed: ${parsed.message}`);
    return result;
  }

  // Build disclose paths dynamically (same logic as the updated handler)
  const disclose: string[] = [];
  const body = JSON.parse(parsed.body.toString());
  if (body.active && body.active.length > 0) {
    body.active.forEach((sub: any, index: number) => {
      disclose.push(`/active/${index}/subscriptionId`);
      disclose.push(`/active/${index}/status`);
      if (sub.latestPlan?.paidPrice !== undefined) {
        disclose.push(`/active/${index}/latestPlan/paidPrice`);
      }
    });
  }

  const request = {
    url,
    method: 'GET' as const,
    headers: {} as Record<string, string>,
  };

  const commit = newCommitForRequest(request, transcript, parsed, disclose);
  if (commit instanceof Error) {
    // For 0-subscription case with empty disclose, an empty commit is expected
    if (disclose.length === 0) {
      result.disclosed = [];
      if (expectedFragments.length === 0) {
        return result;
      }
      result.passed = false;
      result.errors.push(`Expected fragments but got error: ${commit.message}`);
      return result;
    }
    result.passed = false;
    result.errors.push(`newCommitForRequest failed: ${commit.message}`);
    return result;
  }

  // For 0-subscriptions case with no disclose paths
  if (disclose.length === 0 && expectedFragments.length === 0) {
    if (commit.recv.length === 0) {
      return result;
    }
    result.passed = false;
    result.errors.push(`Expected 0 recv ranges but got ${commit.recv.length}`);
    return result;
  }

  // Extract disclosed strings from transcript
  for (const range of commit.recv) {
    const disclosed = recvBuf.subarray(range.start, range.end).toString('utf-8');
    result.disclosed.push(disclosed);
  }

  // Verify expected fragments are found in disclosed strings
  const allDisclosed = result.disclosed.join(' ||| ');
  for (const frag of expectedFragments) {
    if (!allDisclosed.includes(frag)) {
      result.passed = false;
      result.errors.push(`Missing expected fragment: "${frag}"`);
    }
  }

  // Verify all recv ranges point to unique positions (catches duplicate indexOf bug)
  const rangeKeys = commit.recv.map((r: {start: number, end: number}) => `${r.start}-${r.end}`);
  const uniqueRanges = new Set(rangeKeys);
  if (uniqueRanges.size !== rangeKeys.length) {
    result.passed = false;
    result.errors.push(`Duplicate byte ranges detected: [${rangeKeys.join(', ')}]`);
  }

  // Verify no unexpected data leaks: each disclosed string should only
  // contain JSON key-value content (keys we asked for + their values)
  const allowedKeys = new Set(['subscriptionId', 'status', 'paidPrice']);
  for (const disclosed of result.disclosed) {
    // Each disclosed range is like: "subscriptionId":"abc123"
    // Extract the key name from the disclosed string
    const keyMatch = disclosed.match(/"([^"]+)"\s*:/);
    if (keyMatch && !allowedKeys.has(keyMatch[1])) {
      result.passed = false;
      result.errors.push(`Unexpected key disclosed: "${keyMatch[1]}" in "${disclosed}"`);
    }
  }

  return result;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const URL = 'https://speedysub.apps.apple.com/subscription/v3/manage/list';

const TWO_ACTIVE = {
  active: [
    {
      subscriptionId: 'sub-001-apple-music',
      status: 'Active',
      serviceType: 'AUTO_RENEWABLE',
      publicationName: 'Apple Music',
      latestPlan: {
        paidPrice: '$10.99',
        billingPeriod: 'P1M',
      },
    },
    {
      subscriptionId: 'sub-002-icloud-plus',
      status: 'Active',
      serviceType: 'AUTO_RENEWABLE',
      publicationName: 'iCloud+',
      latestPlan: {
        paidPrice: '$2.99',
        billingPeriod: 'P1M',
      },
    },
  ],
};

const ONE_ACTIVE = {
  active: [
    {
      subscriptionId: 'sub-003-tv-plus',
      status: 'Active',
      serviceType: 'AUTO_RENEWABLE',
      publicationName: 'Apple TV+',
      latestPlan: {
        paidPrice: '$9.99',
        billingPeriod: 'P1M',
      },
    },
  ],
};

const ZERO_ACTIVE = {
  active: [],
};

// Real API format: latestPlan has paidPrice (string), no priceUnformatted.
// Both subs have "status":"Active" — tests the duplicate-value indexOf bug.
const REAL_API_FORMAT = {
  userInfo: { shouldShowSharingMasterToggle: false, isInFamily: false },
  devices: [],
  active: [
    {
      subscriptionId: '70000090985302',
      familyId: '21344937',
      status: 'Active',
      serviceType: 'iCloudStorage',
      publicationName: 'iCloud+',
      nextPlan: {
        salableAdamId: '6449562682',
        displayName: 'iCloud+ with 200 GB of storage',
        period: 'P1M',
        price: '149,00 RUB',
        priceUnformatted: 14900,
      },
      latestPlan: {
        salableAdamId: '6449562682',
        displayName: 'iCloud+ with 200 GB of storage',
        expirationDateFormatted: '15 February',
        period: 'P1M',
        paidPrice: '149,00 RUB',
      },
    },
    {
      subscriptionId: '70000146792068',
      familyId: '20927808',
      status: 'Active',
      serviceType: 'IAP',
      publicationName: 'Litres',
      nextPlan: {
        salableAdamId: '1611000610',
        displayName: 'Litres 1 month',
        period: 'P1M',
        price: '399,00 RUB',
        priceUnformatted: 39900,
      },
      latestPlan: {
        salableAdamId: '1611000610',
        displayName: 'Litres 1 month',
        expirationDateFormatted: '26 February',
        period: 'P1M',
        paidPrice: '399,00 RUB',
      },
    },
  ],
  upcoming: [],
  expired: [],
  pending: [],
};

// ─── Run Tests ──────────────────────────────────────────────────────────────

console.log('Apple Subscriptions Disclosure Tests\n' + '='.repeat(40) + '\n');

const scenarios: TestResult[] = [
  // ── Compact JSON (no spaces after colons) ──
  runScenario(
    '2 active subscriptions (compact)',
    JSON.stringify(TWO_ACTIVE),
    URL,
    [
      '"subscriptionId":"sub-001-apple-music"',
      '"status":"Active"',
      '"paidPrice":"$10.99"',
      '"subscriptionId":"sub-002-icloud-plus"',
      '"paidPrice":"$2.99"',
    ],
  ),
  runScenario(
    '1 active subscription (compact)',
    JSON.stringify(ONE_ACTIVE),
    URL,
    [
      '"subscriptionId":"sub-003-tv-plus"',
      '"status":"Active"',
      '"paidPrice":"$9.99"',
    ],
  ),
  runScenario(
    '0 active subscriptions (compact)',
    JSON.stringify(ZERO_ACTIVE),
    URL,
    [],
  ),
  // ── Pretty-printed JSON (spaces after colons, newlines) ──
  runScenario(
    '2 active subscriptions (pretty)',
    JSON.stringify(TWO_ACTIVE, null, 2),
    URL,
    [
      '"subscriptionId": "sub-001-apple-music"',
      '"status": "Active"',
      '"paidPrice": "$10.99"',
      '"subscriptionId": "sub-002-icloud-plus"',
      '"paidPrice": "$2.99"',
    ],
  ),
  runScenario(
    '1 active subscription (pretty)',
    JSON.stringify(ONE_ACTIVE, null, 2),
    URL,
    [
      '"subscriptionId": "sub-003-tv-plus"',
      '"status": "Active"',
      '"paidPrice": "$9.99"',
    ],
  ),
  runScenario(
    '0 active subscriptions (pretty)',
    JSON.stringify(ZERO_ACTIVE, null, 2),
    URL,
    [],
  ),
  // ── Real API format (paidPrice in latestPlan, duplicate "status":"Active") ──
  runScenario(
    'Real API: 2 subs, paidPrice, duplicate status (compact)',
    JSON.stringify(REAL_API_FORMAT),
    URL,
    [
      '"subscriptionId":"70000090985302"',
      '"subscriptionId":"70000146792068"',
      '"paidPrice":"149,00 RUB"',
      '"paidPrice":"399,00 RUB"',
    ],
  ),
  runScenario(
    'Real API: 2 subs, paidPrice, duplicate status (pretty)',
    JSON.stringify(REAL_API_FORMAT, null, 2),
    URL,
    [
      '"subscriptionId": "70000090985302"',
      '"subscriptionId": "70000146792068"',
      '"paidPrice": "149,00 RUB"',
      '"paidPrice": "399,00 RUB"',
    ],
  ),
];

let allPassed = true;
for (const s of scenarios) {
  const icon = s.passed ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${s.name}`);
  if (s.disclosed.length > 0) {
    console.log('  Disclosed ranges:');
    for (const d of s.disclosed) {
      console.log(`    "${d}"`);
    }
  } else {
    console.log('  No data disclosed (empty disclose paths)');
  }
  if (s.errors.length > 0) {
    console.log('  Errors:');
    for (const e of s.errors) {
      console.log(`    - ${e}`);
    }
  }
  console.log();
  if (!s.passed) allPassed = false;
}

console.log('='.repeat(40));
console.log(allPassed ? 'All tests passed.' : 'Some tests FAILED.');
process.exit(allPassed ? 0 : 1);
