# Click + bell "ching" for the animated follow button (FollowButton in src/tasavvur/common.tsx).
# Import and call add_follow(add, SR, t0) from an episode's sfx script: click at t0+1.0 s, bell at t0+1.25 s.
import numpy as np

def click(SR):
    n = int(SR * 0.05); t = np.arange(n) / SR
    rng = np.random.default_rng(7)
    return (rng.standard_normal(n) * np.exp(-t * 300) * 0.6 + np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 200) * 0.5)

def ching(SR):
    n = int(SR * 1.4); t = np.arange(n) / SR
    s = np.zeros(n)
    for f, a, d in [(1568, 1.0, 0.55), (2349, 0.7, 0.4), (3136, 0.45, 0.3), (4186, 0.3, 0.2), (5274, 0.18, 0.12)]:
        s += a * np.sin(2 * np.pi * f * t * (1 + 0.002 * np.sin(2 * np.pi * 6 * t))) * np.exp(-t / d)
    # second softer strike for a "ching-ching" ring
    k = int(SR * 0.12)
    s[k:] += 0.5 * s[: n - k]
    return s * np.minimum(t / 0.002, 1) * 0.45

def add_follow(add, SR, t0, tap=1.0, bell=1.25):
    add(click(SR), t0 + tap, 0.8)
    add(ching(SR), t0 + bell, 1.0)
