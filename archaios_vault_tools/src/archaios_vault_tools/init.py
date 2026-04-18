"""CLI shim for archaios_init command."""

from archaios_vault_tools.capture import init_main


def main() -> None:
    init_main()


if __name__ == "__main__":
    main()
