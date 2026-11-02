# Contributing a failure model

A good contribution teaches one concrete failure. Begin with an issue describing the promise, the sequence that breaks it, and the assumptions required to correct it. Small reproducible examples are more useful than broad orchestration frameworks.

Each scenario should include an unsafe model with a real counterexample, a corrected model, named regression runs that execute useful behavior, explicit scope and service assumptions, and a negative control showing that the checks detect the relevant mistake. Use synthetic fixtures you can publish. Never include provider credentials, private work histories, or production incident data without permission.

## Development

```sh
npm ci --ignore-scripts
npm test
npm run verify
```

Java 21 is needed for full verification. If you intentionally change the existing model, run `npm run example`, inspect the resulting trace and hashes, and rerun all checks. Do not regenerate evidence just to hide an unexplained mismatch.

Pull requests should explain the modeled boundary, broken behavior, correction, scope, and verification results. Passing a model is not evidence that a real service supplies its assumptions. Keep runtime and model claims separate.

Contributions are licensed under Apache-2.0. No contributor agreement or paid service is required.
