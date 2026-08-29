"""
features.py
-----------
Convert raw recruiter decision records (plain Python dicts) into normalised
feature tensors for the LSTM.

No database, no API — input is a list of dicts that can come from a JSON file,
a unit test, or any upstream source.

Expected input format
---------------------
Each record is a dict with these keys (all optional with sensible defaults):

    {
        "recruiter_id":  "rec_001",          # str  — used to group sequences
        "student": {
            "cgpa":             8.5,         # float 0–10
            "branch":           "CSE",       # str
            "skills":           ["Python"],  # list[str]
            "experience_years": 1.5          # float
        },
        "status":        "Shortlisted",      # "Shortlisted" | "Rejected"
        "timestamp":     "2024-03-15T10:30"  # ISO-8601 str (used for ordering)
    }

Output feature vector (5 dimensions, all 0–1 normalised)
---------------------------------------------------------
    [cgpa_norm, branch_enc, skills_norm, experience_norm, label]

    cgpa_norm        = cgpa / 10
    branch_enc       = index-in-known-list / (n_branches - 1)
    skills_norm      = min(len(skills), MAX_SKILLS) / MAX_SKILLS
    experience_norm  = min(experience_years, MAX_EXP) / MAX_EXP
    label            = 1.0 if Shortlisted else 0.0
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Tuple

import numpy as np
import torch

# ── normalisation constants ────────────────────────────────────────────────
MAX_CGPA = 10.0
MAX_SKILLS = 20
MAX_EXPERIENCE = 10.0

KNOWN_BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "CHEM", "BIO", "OTHER"]
_BRANCH_INDEX = {b: i for i, b in enumerate(KNOWN_BRANCHES)}


def _encode_branch(branch: str) -> float:
    key = branch.upper().strip()
    idx = _BRANCH_INDEX.get(key, _BRANCH_INDEX["OTHER"])
    return idx / (len(KNOWN_BRANCHES) - 1)


def record_to_vector(record: dict) -> List[float]:
    """Convert one decision record dict into a 5-d normalised feature vector."""
    student = record.get("student", {})

    cgpa = float(student.get("cgpa", 0.0)) / MAX_CGPA
    branch = _encode_branch(student.get("branch", "OTHER"))
    skills = min(len(student.get("skills", [])), MAX_SKILLS) / MAX_SKILLS
    experience = min(float(student.get("experience_years", 0.0)), MAX_EXPERIENCE) / MAX_EXPERIENCE
    label = 1.0 if record.get("status") == "Shortlisted" else 0.0

    return [
        round(min(max(cgpa, 0.0), 1.0), 6),
        round(branch, 6),
        round(min(max(skills, 0.0), 1.0), 6),
        round(min(max(experience, 0.0), 1.0), 6),
        label,
    ]


def _parse_ts(record: dict) -> datetime:
    ts = record.get("timestamp", "")
    if not ts:
        return datetime.min
    try:
        return datetime.fromisoformat(ts)
    except ValueError:
        return datetime.min


def group_by_recruiter(records: List[dict]) -> Dict[str, List[dict]]:
    """Group and sort records by recruiter_id, oldest-first."""
    groups: Dict[str, List[dict]] = {}
    for r in records:
        rid = str(r.get("recruiter_id", "unknown"))
        groups.setdefault(rid, []).append(r)
    return {rid: sorted(recs, key=_parse_ts) for rid, recs in groups.items()}


def build_sequences(
    records: List[dict],
    window: int = 20,
    min_decisions: int = 5,
) -> Tuple[torch.Tensor, List[str]]:
    """
    Convert a flat list of decision records into sliding-window tensors.

    Args:
        records:       list of decision dicts (see module docstring)
        window:        length of each input sequence
        min_decisions: skip recruiters with fewer decisions than this

    Returns:
        tensor:  (N_windows, window, 5)   — ready to feed into the model
        rids:    list[str] of length N_windows — recruiter id per window
    """
    groups = group_by_recruiter(records)

    windows: List[np.ndarray] = []
    rids: List[str] = []

    for rid, recs in groups.items():
        if len(recs) < min_decisions:
            continue
        vecs = np.array([record_to_vector(r) for r in recs], dtype=np.float32)
        for start in range(len(vecs) - window + 1):
            windows.append(vecs[start : start + window])
            rids.append(rid)

    if not windows:
        return torch.zeros(0, window, 5, dtype=torch.float32), []

    return torch.tensor(np.stack(windows), dtype=torch.float32), rids


def latest_window(
    records: List[dict],
    recruiter_id: str,
    window: int = 20,
) -> torch.Tensor | None:
    """
    Extract the *most recent* window of decisions for a single recruiter.
    Returns None if that recruiter has fewer than `window` decisions.

    Args:
        records:      full list of decision dicts
        recruiter_id: which recruiter to extract
        window:       sequence length expected by the model
    Returns:
        tensor of shape (1, window, 5), or None
    """
    groups = group_by_recruiter(records)
    recs = groups.get(recruiter_id, [])
    if len(recs) < window:
        return None
    vecs = np.array([record_to_vector(r) for r in recs[-window:]], dtype=np.float32)
    return torch.tensor(vecs[np.newaxis], dtype=torch.float32)   # (1, T, 5)