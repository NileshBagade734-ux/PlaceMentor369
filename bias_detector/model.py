"""
model.py
--------
LSTM with attention for recruiter bias CLASSIFICATION.

Approach changed from autoencoder to supervised classifier.
- Autoencoder failed because consistent bias reconstructs better than noisy fair patterns
- Classifier directly learns: "does this sequence look biased or fair?"

Input:  sequence of T decision vectors, shape (batch, T, 5)
Output: bias probability per sequence, shape (batch,)
        attention weights showing which decisions mattered, shape (batch, T)
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class AttentionLayer(nn.Module):
    """
    Bahdanau additive attention over LSTM hidden states.
    Returns context vector and attention weights (for explainability).
    """
    def __init__(self, hidden_dim: int):
        super().__init__()
        self.W = nn.Linear(hidden_dim, hidden_dim, bias=False)
        self.v = nn.Linear(hidden_dim, 1, bias=False)

    def forward(self, hidden_states: torch.Tensor):
        # hidden_states: (B, T, H)
        energy  = self.v(torch.tanh(self.W(hidden_states)))  # (B, T, 1)
        weights = F.softmax(energy.squeeze(-1), dim=1)        # (B, T)
        context = torch.bmm(weights.unsqueeze(1), hidden_states).squeeze(1)  # (B, H)
        return context, weights


class BiasDetectorLSTM(nn.Module):
    """
    Supervised bias classifier.

    forward() returns:
        prob         (batch,)    — probability of bias, 0-1
        attn_weights (batch, T)  — which decisions drove the prediction
    """

    INPUT_DIM = 5

    def __init__(self, hidden_dim: int = 64, num_layers: int = 2, dropout: float = 0.3):
        super().__init__()
        self.input_proj = nn.Linear(self.INPUT_DIM, hidden_dim)
        self.lstm = nn.LSTM(
            input_size=hidden_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        self.attention = AttentionLayer(hidden_dim)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, 1),
        )

    def forward(self, x: torch.Tensor):
        # x: (B, T, 5)
        projected        = self.input_proj(x)                      # (B, T, H)
        lstm_out, _      = self.lstm(projected)                    # (B, T, H)
        context, weights = self.attention(lstm_out)                # (B, H), (B, T)
        logit            = self.classifier(context).squeeze(-1)    # (B,)
        prob             = torch.sigmoid(logit)                    # (B,)
        return prob, weights