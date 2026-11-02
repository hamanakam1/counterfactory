import assert from 'node:assert/strict';

export function validateCounterexample(trace) {
  assert.equal(trace?.['#meta']?.status, 'violation', 'expected a violation trace');
  assert.deepEqual(trace.vars, ['lost_ack_unsafe::protocol::s'], 'unexpected trace variables');
  assert.equal(trace.states?.length, 9, 'expected the complete nine-state schedule');
  const events = ['init', 'acquire A', 'submit A', 'commit A', 'lose ack A',
    'expire lease', 'acquire B', 'submit B', 'commit B'];
  return trace.states.map((state, index) => {
    const s = state[trace.vars[0]];
    assert.equal(s?.event, events[index], 'unexpected schedule');
    const effects = Number(s.effects?.['#bigint']);
    assert(Number.isSafeInteger(effects), 'invalid effect count');
    assert.equal(effects, index < 3 ? 0 : index < 8 ? 1 : 2, 'unexpected effect count');
    assert.equal(s.knownDone, false, 'unexpected completion claim');
    for (const key of ['submitted', 'pending', 'replies']) {
      assert(Array.isArray(s[key]?.['#set']), 'invalid ITF set');
    }
    return { ...s, effects };
  });
}

export function assertExpectedViolation(result, kind = 'invariant') {
  const text = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  assert.equal(result.status, 1, 'expected an invariant violation exit');
  assert(!result.signal && !result.error, 'expected a completed checker');
  const diagnosis = kind === 'temporal'
    ? /Temporal property \w+ was violated\./
    : /Invariant violated|Invariant \w+ is violated\./;
  assert(text.includes('[violation]') && diagnosis.test(text), 'expected the specific violation diagnosis');
}

export function assertProvenance(recorded, actual) {
  assert.deepEqual(recorded, actual, 'evidence provenance mismatch; regenerate the example explicitly');
}
