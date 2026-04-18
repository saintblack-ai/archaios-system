"""PDF generation helpers with runtime fallbacks for macOS."""

from __future__ import annotations

import html
import shutil
import subprocess
import tempfile
from pathlib import Path


def _simple_markdown_to_html(md_text: str) -> str:
    lines = md_text.splitlines()
    out: list[str] = ["<html><head><meta charset='utf-8'></head><body>"]
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("### "):
            out.append(f"<h3>{html.escape(stripped[4:])}</h3>")
        elif stripped.startswith("## "):
            out.append(f"<h2>{html.escape(stripped[3:])}</h2>")
        elif stripped.startswith("# "):
            out.append(f"<h1>{html.escape(stripped[2:])}</h1>")
        elif stripped.startswith("- "):
            out.append(f"<p>&bull; {html.escape(stripped[2:])}</p>")
        else:
            out.append(f"<p>{html.escape(line)}</p>")
    out.append("</body></html>")
    return "\n".join(out)


def generate_pdf(markdown_path: Path, pdf_path: Path) -> tuple[bool, str]:
    pandoc = shutil.which("pandoc")
    if pandoc:
        cmd = [pandoc, str(markdown_path), "-o", str(pdf_path)]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode == 0:
            return True, "pandoc"

    wkhtml = shutil.which("wkhtmltopdf")
    if wkhtml:
        html_content = _simple_markdown_to_html(markdown_path.read_text(encoding="utf-8"))
        with tempfile.NamedTemporaryFile(mode="w", suffix=".html", delete=False, encoding="utf-8") as tmp:
            tmp.write(html_content)
            tmp_path = Path(tmp.name)
        try:
            cmd = [wkhtml, str(tmp_path), str(pdf_path)]
            proc = subprocess.run(cmd, capture_output=True, text=True)
            if proc.returncode == 0:
                return True, "wkhtmltopdf"
        finally:
            tmp_path.unlink(missing_ok=True)

    return False, "none"
