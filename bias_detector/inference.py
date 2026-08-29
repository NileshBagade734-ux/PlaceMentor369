"""
inference.py
------------
Score a recruiter using the trained classifier.
Output is now a BIAS PROBABILITY (0-1), not a reconstruction error.
0.0 = definitely fair, 1.0 = definitely biased.
"""

import argparse
import json
from typing import Any, Dict, List, Tuple

import torch

from features import latest_window, group_by_recruiter
from model import BiasDetectorLSTM

DEFAULT_THRESHOLD = 0.5   # probability above this = flagged


def load_model(checkpoint_path: str) -> Tuple[BiasDetectorLSTM, dict]:
    ckpt   = torch.load(checkpoint_path, map_location="cpu", weights_only=True)
    cfg    = ckpt["config"]
    model  = BiasDetectorLSTM(
        hidden_dim=cfg["hidden_dim"],
        num_layers=cfg["num_layers"],
        dropout=cfg["dropout"],
    )
    model.load_state_dict(ckpt["model_state"])
    model.eval()
    return model, cfg


def score_recruiter(
    model: BiasDetectorLSTM,
    config: dict,
    records: List[dict],
    recruiter_id: str,
    threshold: float = DEFAULT_THRESHOLD,
    top_k: int = 3,
) -> Dict[str, Any]:
    window = config["window"]
    x      = latest_window(records, recruiter_id, window=window)

    if x is None:
        return {"recruiter_id": recruiter_id, "error": f"Fewer than {window} decisions."}

    with torch.no_grad():
        prob, attn_weights = model(x)              # (1,), (1, T)

    bias_prob = float(prob.item())
    attn      = attn_weights.squeeze(0).tolist()   # list[float]

    groups       = group_by_recruiter(records)
    window_recs  = groups.get(recruiter_id, [])[-window:]

    top_indices  = sorted(range(len(attn)), key=lambda i: attn[i], reverse=True)[:top_k]
    top_decisions = [
        {
            "index_in_window":  i,
            "attention_weight": round(attn[i], 4),
            "status":           window_recs[i].get("status"),
            "student":          window_recs[i].get("student", {}),
            "timestamp":        window_recs[i].get("timestamp"),
        }
        for i in sorted(top_indices)
    ]

    return {
        "recruiter_id":    recruiter_id,
        "bias_probability": round(bias_prob, 4),
        "flagged":          bias_prob > threshold,
        "threshold":        threshold,
        "attention":        [round(w, 4) for w in attn],
        "flagged_indices":  sorted(top_indices),
        "top_decisions":    top_decisions,
    }


def score_all_recruiters(
    model, config, records, threshold=DEFAULT_THRESHOLD,
) -> List[Dict[str, Any]]:
    groups  = group_by_recruiter(records)
    results = [
        score_recruiter(model, config, records, rid, threshold=threshold)
        for rid in groups
    ]
    results.sort(key=lambda r: r.get("bias_probability", -1), reverse=True)
    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model",     required=True)
    parser.add_argument("--data",      required=True)
    parser.add_argument("--recruiter", default=None)
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD)
    parser.add_argument("--top_k",     type=int,   default=3)
    args = parser.parse_args()

    with open(args.data) as f:
        records = json.load(f)

    model, cfg = load_model(args.model)
    print(f"Model loaded  (window={cfg['window']}, hidden={cfg['hidden_dim']})\n")

    if args.recruiter:
        results = [score_recruiter(model, cfg, records, args.recruiter,
                                   threshold=args.threshold, top_k=args.top_k)]
    else:
        results = score_all_recruiters(model, cfg, records, threshold=args.threshold)

    for r in results:
        if "error" in r:
            print(f"[SKIP] {r['recruiter_id']}: {r['error']}")
            continue

        flag  = "FLAGGED" if r["flagged"] else "OK     "
        prob  = r["bias_probability"]
        bar   = "█" * int(prob * 20) + "░" * (20 - int(prob * 20))

        print(f"{'⚠️ ' if r['flagged'] else '   '}{flag}  {r['recruiter_id']:22s}  "
              f"bias={prob:.4f}  [{bar}]")

        if r["flagged"]:
            print("         Top attended decisions:")
            for d in r["top_decisions"]:
                cgpa = d["student"].get("cgpa", "?")
                print(f"           [t={d['index_in_window']:2d}]  {d['status']:12s}  "
                      f"CGPA={cgpa}  attn={d['attention_weight']:.4f}  ({d['timestamp']})")
        print()


if __name__ == "__main__":
    main()