"""Module entry point for ai_assassins_local."""

from ai_assassins_local import briefing


def main() -> None:
    try:
        briefing.run()
    except PermissionError as exc:
        print(f"Execution blocked by approval gate: {exc}")
    except Exception as exc:
        print(f"Briefing failed gracefully: {exc}")


if __name__ == "__main__":
    main()
