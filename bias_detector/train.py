"""
train.py
--------
Supervised training for BiasDetectorLSTM classifier.

Usage:
    python train.py                          # synthetic data
    python train.py --data decisions.json   # your own data
"""

import argparse
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from features import build_sequences
from model import BiasDetectorLSTM

BRANCHES   = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "BIO", "OTHER"]
SKILLS_POOL = ["Python", "Java", "C++", "ML", "SQL", "React", "Node", "Data Analysis"]


# ── synthetic data ─────────────────────────────────────────────────────────

def _make_fair_record(recruiter_id, base_time, offset_hours, cgpa_cutoff):
    cgpa     = round(random.uniform(4.0, 10.0), 2)
    n_skills = random.randint(1, 6)
    branch   = random.choice(BRANCHES)
    merit    = cgpa >= cgpa_cutoff and n_skills >= 3
    if merit:
        status = "Shortlisted" if random.random() < 0.85 else "Rejected"
    else:
        status = "Rejected" if random.random() < 0.85 else "Shortlisted"
    return {
        "recruiter_id": recruiter_id,
        "status": status,
        "timestamp": (base_time + timedelta(hours=offset_hours)).isoformat(),
        "student": {
            "cgpa": cgpa, "branch": branch,
            "skills": random.sample(SKILLS_POOL, n_skills),
            "experience_years": round(random.uniform(0, 5), 1),
        },
    }


def _make_biased_record(recruiter_id, base_time, offset_hours, bias_type, bias_branch):
    cgpa     = round(random.uniform(4.0, 10.0), 2)
    n_skills = random.randint(1, 6)
    branch   = random.choice(BRANCHES)

    if bias_type == "cgpa_invert":
        if cgpa >= 7.5:
            status = "Rejected" if random.random() < 0.90 else "Shortlisted"
        else:
            status = "Shortlisted" if random.random() < 0.90 else "Rejected"

    elif bias_type == "branch_bias":
        if branch == bias_branch:
            status = "Rejected" if random.random() < 0.92 else "Shortlisted"
        else:
            status = "Shortlisted" if cgpa >= 6.5 and random.random() < 0.75 else "Rejected"

    else:  # skills_ignore — purely random decisions
        status = "Shortlisted" if random.random() < 0.50 else "Rejected"

    return {
        "recruiter_id": recruiter_id,
        "status": status,
        "timestamp": (base_time + timedelta(hours=offset_hours)).isoformat(),
        "student": {
            "cgpa": cgpa, "branch": branch,
            "skills": random.sample(SKILLS_POOL, n_skills),
            "experience_years": round(random.uniform(0, 5), 1),
        },
    }


def generate_synthetic_data(
    n_fair_recruiters: int = 40,
    n_biased_recruiters: int = 10,
    decisions_per_recruiter: int = 80,
    seed: int = 42,
) -> list:
    random.seed(seed)
    records = []
    base    = datetime(2024, 1, 1)

    for i in range(n_fair_recruiters):
        rid          = f"fair_rec_{i:03d}"
        cgpa_cutoff  = random.uniform(6.0, 8.0)
        for h in range(decisions_per_recruiter):
            records.append(_make_fair_record(rid, base, h * 8, cgpa_cutoff))

    for i in range(n_biased_recruiters):
        rid          = f"biased_rec_{i:03d}"
        bias_type    = random.choice(["cgpa_invert", "branch_bias", "skills_ignore"])
        bias_branch  = random.choice(BRANCHES)
        for h in range(decisions_per_recruiter):
            records.append(_make_biased_record(rid, base, h * 8, bias_type, bias_branch))

    return records


# ── training ───────────────────────────────────────────────────────────────

def train(
    records: list,
    window: int = 20,
    hidden_dim: int = 64,
    num_layers: int = 2,
    dropout: float = 0.3,
    epochs: int = 40,
    batch_size: int = 32,
    lr: float = 1e-3,
    save_path: str = "bias_detector.pt",
):
    # Build sequences WITH labels (1=biased, 0=fair)
    tensor, rids = build_sequences(records, window=window, min_decisions=window)
    if tensor.shape[0] == 0:
        raise ValueError("No sequences built.")

    # Label each window by recruiter id
    labels = torch.tensor(
        [1.0 if "biased" in rid else 0.0 for rid in rids],
        dtype=torch.float32,
    )

    print(f"Windows: {tensor.shape[0]}  |  biased: {int(labels.sum())}  fair: {int((1-labels).sum())}")

    dataset = TensorDataset(tensor, labels)
    loader  = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    model     = BiasDetectorLSTM(hidden_dim=hidden_dim, num_layers=num_layers, dropout=dropout)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.BCELoss()

    # Class weights — handle imbalance (more fair than biased windows)
    n_biased = labels.sum().item()
    n_fair   = len(labels) - n_biased
    pos_weight = torch.tensor([n_fair / n_biased])
    criterion  = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

    model.train()
    for epoch in range(1, epochs + 1):
        epoch_loss   = 0.0
        correct      = 0

        for batch_x, batch_y in loader:
            optimizer.zero_grad()
            prob, _  = model(batch_x)
            # BCEWithLogitsLoss expects raw logits, get them via inverse sigmoid
            logits   = torch.log(prob / (1 - prob + 1e-8))
            loss     = criterion(logits, batch_y)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            epoch_loss += loss.item() * batch_x.shape[0]
            preds       = (prob > 0.5).float()
            correct    += (preds == batch_y).sum().item()

        avg_loss = epoch_loss / len(dataset)
        acc      = correct / len(dataset) * 100

        if epoch % 5 == 0 or epoch == 1:
            print(f"  Epoch {epoch:3d}/{epochs}  loss={avg_loss:.4f}  acc={acc:.1f}%")

    torch.save({
        "model_state": model.state_dict(),
        "config": {
            "hidden_dim": hidden_dim,
            "num_layers": num_layers,
            "dropout":    dropout,
            "window":     window,
        },
    }, save_path)
    print(f"\nModel saved → {save_path}")
    return model


# ── CLI ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data",   default=None)
    parser.add_argument("--epochs", type=int,   default=40)
    parser.add_argument("--lr",     type=float, default=1e-3)
    parser.add_argument("--window", type=int,   default=20)
    parser.add_argument("--hidden", type=int,   default=64)
    parser.add_argument("--layers", type=int,   default=2)
    parser.add_argument("--batch",  type=int,   default=32)
    parser.add_argument("--out",    default="bias_detector.pt")
    args = parser.parse_args()

    if args.data:
        with open(args.data) as f:
            records = json.load(f)
    else:
        print("Using synthetic data.")
        records = generate_synthetic_data()

    train(
        records,
        window=args.window, hidden_dim=args.hidden,
        num_layers=args.layers, epochs=args.epochs,
        batch_size=args.batch, lr=args.lr, save_path=args.out,
    )


if __name__ == "__main__":
    main()