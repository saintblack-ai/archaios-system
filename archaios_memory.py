from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any, Dict, List, Optional

import chromadb

_MEMORY_DIR = Path(__file__).resolve().parent / "archaios_memory"
_CLIENT = chromadb.PersistentClient(path=str(_MEMORY_DIR))
_COLLECTION = _CLIENT.get_or_create_collection("core_memory")


def _stable_id(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _embed_text(text: str, dims: int = 32) -> List[float]:
    # Deterministic local embedding to avoid external model downloads.
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    values = list(digest) * ((dims // len(digest)) + 1)
    vector = values[:dims]
    return [v / 255.0 for v in vector]


def store_memory(text: str, metadata: Optional[Dict[str, Any]] = None) -> str:
    doc_id = _stable_id(text)

    payload: Dict[str, Any] = {
        "documents": [text],
        "embeddings": [_embed_text(text)],
        "ids": [doc_id],
    }
    if metadata:
        payload["metadatas"] = [metadata]

    # upsert avoids duplicate-id failures for repeated text
    _COLLECTION.upsert(**payload)
    return doc_id


def retrieve_memory(query: str, n_results: int = 4) -> List[str]:
    results = _COLLECTION.query(
        query_embeddings=[_embed_text(query)],
        n_results=n_results,
    )
    documents = results.get("documents") or []
    if not documents:
        return []
    # Chroma returns a nested list per query text.
    return documents[0]
