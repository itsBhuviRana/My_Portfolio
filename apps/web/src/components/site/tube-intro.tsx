/**
 * The first-visit intro: a blown-out white room lit by one tube light hanging in from the top edge, and a
 * wall switch. Turning the switch off flips it to OFF, dims the tube slowly, and lets the white light drain
 * downward and out of the screen, uncovering the real (black) page.
 *
 * This is static markup only. Whether it shows, and everything that happens when the switch is used, is
 * handled by `TUBE_INTRO_SCRIPT` (tube-intro-script.ts), an inline `<head>` script that does not depend on
 * React hydrating; the styles are in tube-intro.css. Without that script's `data-intro` attribute on
 * `<html>` the overlay is `display: none` — no-JS, reduced-motion and repeat visits just get the page.
 * `?intro` in the URL forces a replay for review.
 */
export function TubeIntro() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tube-intro-title"
      className="tube-intro"
      suppressHydrationWarning
    >
      <div className="tube-room" aria-hidden="true" />

      <div className="tube-fixture" aria-hidden="true">
        <span className="tube-wire tube-wire-left" />
        <span className="tube-wire tube-wire-right" />
        <div className="tube-housing">
          <div className="tube-body">
            <div className="tube-lit" />
          </div>
        </div>
      </div>

      <div className="tube-ui">
        <h2 id="tube-intro-title" className="tube-title type-h3 m-0">
          Please turn off the tube light to know me who I am
        </h2>
        <button
          type="button"
          role="switch"
          aria-checked="true"
          aria-label="Tube light"
          className="tube-switch"
          suppressHydrationWarning
        >
          <span className="tube-plate">
            <span className="tube-mark tube-mark-on" aria-hidden="true">
              ON
            </span>
            <span className="tube-rocker" aria-hidden="true" />
            <span className="tube-mark tube-mark-off" aria-hidden="true">
              OFF
            </span>
          </span>
        </button>
        <p className="tube-status tech-label m-0" aria-hidden="true">
          Light is{" "}
          <span className="tube-status-value" suppressHydrationWarning>
            ON
          </span>
        </p>
        <p className="tube-hint tech-label m-0" aria-hidden="true">
          Tap the switch
        </p>
      </div>
    </div>
  );
}
