# Security

Counterfactory executes local specifications. It does not authorize agent actions, sandbox workers, issue credentials, or prove a production implementation safe. Its examples are synthetic and make no external service calls.

Treat downloaded models and tool dependencies as code. Use trusted local environments for verification. The upstream translation tools may start a local JVM server; do not publish its port or supply production credentials to this project.

For a sensitive vulnerability, use GitHub's private vulnerability reporting on this repository when available. Do not put secrets or exploit details affecting a real service into a public issue. Ordinary model errors and incorrect assumptions can be reported as issues with a small synthetic counterexample.

Version 0.1 is a research preview with no production security support or response-time guarantee.
