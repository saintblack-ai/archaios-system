# ARCHAIOS Runtime Projects

Ownership: `client/archaios-core/projects/` is reserved for runtime project contracts and future project metadata owned by the canonical runtime.

Current executable write path:

- Core agents write project outputs to `client/projects/<agent-key>/last-run.json`.
- Runtime manifests declare output destinations as `projects/<agent-key>`.

Future migration recommendation:

- Keep `client/projects/` as the operational output root unless all manifests, scripts, dashboards, and docs are updated in one migration.
