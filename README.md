# brierly

Lightweight calibration tracker for probabilistic forecasting. Log a prediction with a
confidence level, resolve it when the outcome lands, and see whether your stated
probabilities actually match reality.

Calibration is a trainable skill: if you say "70%" on a hundred things, about seventy
should come true. brierly keeps you honest about that — without becoming the kind of
overbearing tool it's meant to avoid. It's a mobile-first PWA: React + IndexedDB, no
backend, your data never leaves your device.

## What it tells you

- **Brier score** — mean squared error of your probabilities. `0` is perfect, `0.25` is
  what you'd get always guessing 50% (the bar to beat), `1` is worst.
- **Log loss** — punishes confident-and-wrong far more harshly than Brier; one cocky
  miss costs a lot.
- **Bias** — average of stated minus observed: positive means you're overconfident,
  negative underconfident.
- **Reliability diagram** — your probabilities binned and plotted against the 45° line of
  perfect calibration; points below the line at high confidence reveal overconfidence.

Open predictions past their resolve-by date are surfaced as **due**, so logging doesn't
quietly turn into a graveyard of unresolved guesses.

## Run it

```sh
npm install
npm run dev      # local dev server
npm test         # scoring tests (the math is the one thing that must be right)
npm run build    # production build (PWA: installable, works offline)
```

Open the production build over HTTPS on a phone and use **Add to Home Screen** to install
it like an app — it runs full-screen and offline.

## Your data

Everything lives in your browser's IndexedDB; nothing is sent anywhere. Because that's
per-browser, the **Export JSON** button is the real backup — export periodically, and use
**Import JSON** to restore or move between devices.

## License

[MIT](LICENSE).
