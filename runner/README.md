# CodeRwanda local multi-language runner

CodeRwanda supports the single-file languages reported by a local Judge0 CE instance. That includes the runtimes installed in that instance, not literally every programming language or every package ever created. The language selector updates from `/languages`; no frontend edits are required when runtimes change. Browser JavaScript and HTML/CSS practicals do not need this service.

## Current workstation

The supplied Windows environment has Ubuntu 24.04 in WSL, but no Docker command. Ubuntu uses cgroup v2 and password-protected administration. A live Judge0 runner has **not** been installed or started. Adapter tests use a local test double, not actual language compilers.

Judge0 1.13.1's upstream deployment instructions require Linux, Docker Compose, and the documented cgroup configuration. Use a dedicated Linux VM meeting those requirements rather than changing the existing Windows/WSL kernel configuration automatically. Its workers need privileged containers; keep the runner separate from application data and credentials.

## Setup

1. Prepare a Linux VM using [Judge0's deployment requirements](https://github.com/judge0/judge0/releases/tag/v1.13.1). Install Docker and Docker Compose there.
2. Copy this `runner` folder to that machine. Install Node.js if it is not present, then run `node setup.cjs`. This generates unique credentials and `judge0.conf`; credentials are never printed.
3. Run `docker compose up -d db redis`, wait for their health checks, then run `docker compose up -d`. The supplied configuration pins Judge0 1.13.1, disables telemetry, callbacks, network access from submitted programs, and extra archive uploads. The API binds only to `127.0.0.1:2358`.
4. If CodeRwanda runs on the same Linux machine, copy the three `LOCAL_RUNNER_*` settings from the generated `application.env` into `server/.env`. If CodeRwanda stays on Windows and the runner is on a VM, establish a loopback-only SSH tunnel: `ssh -N -L 127.0.0.1:2358:127.0.0.1:2358 your-user@your-runner-vm`. The adapter only connects to local loopback; no arbitrary remote URL is accepted.
5. Restart CodeRwanda. Run `node runner/check.cjs` from the project root. It checks the live language catalog and executes a harmless Python sample through the sandbox. The script reports success only after real execution returns the expected output.
6. Open **Coding playground**, choose a language, enter source code and input, and run it. In **Practicals & Chat**, choose a runtime when creating a task and add input/output test cases.

## Behavior

- Programs run with a 3-second CPU limit, 10-second wall limit, 256 MB memory limit, 512 KB file limit and networking disabled.
- Up to 10 input/output cases per task, 60 run requests per user per hour, and 2 active requests per user.
- The server chooses the task runtime and test cases. Students cannot override execution limits or access other users' run results.
- Compiler errors, standard output, standard error, time and memory appear in the platform. Self-tests are advisory; official practical marks come from a trainer's server-validated rubric review.
- Single-file console programs are supported. Dependency installation, multi-file build systems, desktop applications and arbitrary network services need a separate project-runtime implementation.
- The language catalog is cached for five minutes. Stop the service with `docker compose down`; do not delete database volumes unless you intend to remove runner records.

References: [Judge0 API](https://ce.judge0.com/), [upstream configuration](https://github.com/judge0/judge0/blob/v1.13.1/judge0.conf), [sandboxed iframe behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe).
