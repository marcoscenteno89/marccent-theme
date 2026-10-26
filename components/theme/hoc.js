'use client';
import { useState, useEffect, useContext, useRef } from 'react';
import { Scene, canvasObserver } from "@marccent/util/canvas";
import { ThemeContext } from "../../lib/context";
import { SITE } from "../../lib/singleton";
import { cx } from '../../lib/cx';
import { Loading } from '../ui/loading';
import '../../styles/components/canvas.css';

const withLoader = (Component) => {
  const WithLoaderComponent = (props) => {
    let ready = true;
    for (let i of Object.values(props.require)) {
      if (i === null) ready = false;
    }
    return ready ? <Component {...props} /> : <Loading {...props} />;
  }
  return WithLoaderComponent;
}

const withThemeRead = (Component) => {
  const WithThemeReadComponent = (props) => {
    const { theme } = useContext(ThemeContext);
    return ( 
      <Loading require={[theme]}>
        <Component {...props} theme={theme} />
      </Loading>
    );
  }
  return WithThemeReadComponent;
}

// Gives Component the theme as one scope sees it (Theme.scoped: props.scope, an element's id; the whole site by
// default) and update / reset for that scope, each with a message (ThemeProvider's notify: the site's toasts);
// notify itself too, for a component's own messages.
const withTheme = (Component) => {
  const WiththemeComponent = (props) => {
    const { theme, path, notify } = useContext(ThemeContext);
    const scope = props.scope ?? SITE;
    const view = theme && theme.scoped(scope, path);
    const what = scope === SITE ? 'Theme' : 'Section';
    const update = (obj) => { view.update(obj); notify(`${what} updated`); };
    const reset = () => { view.reset(); notify(scope === SITE ? 'Theme reset to the defaults' : 'Section reset to the site theme', 'success'); };
    return (
      <Loading require={[theme]}>
        <Component {...props} theme={view} update={update} reset={reset} notify={notify} />
      </Loading>
    );
  }
  return WiththemeComponent;
}

// Decorative animations (backgrounds, previews) run at this rate and one pixel per CSS pixel: soft shapes look
// the same, and a 3x phone screen draws 9x fewer pixels.
const DECORATIVE_FPS = 30;

// Like canvasObserver (@marccent/util), but a decorative animation stays still while the visitor asks for
// reduced motion (OS setting): it keeps the frame already drawn and only animates when on screen and allowed.
// Returns a function that stops watching.
const decorativeObserver = (p, node) => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  const update = () => (visible && !motion.matches ? p.loop() : p.noLoop());
  const observer = new IntersectionObserver(([ entry ]) => { visible = entry.isIntersecting; update(); });
  observer.observe(node);
  motion.addEventListener('change', update);
  update();
  return () => { observer.disconnect(); motion.removeEventListener('change', update); };
}

/**
 * Gives Component a p5 sketch (props.sketch: { p5, sketch, p, canvas }). canvas is a @marccent/util Scene: it
 * draws its <canvas> inside the div this renders and resizes it with the div. props.className / style go on
 * the div. The sketch is removed on unmount.
 * @param {Object} [opts]
 * @param {boolean} [opts.decorative=true] - Decoration, not content: capped at DECORATIVE_FPS, drawn at pixel
 *   density 1 and paused for reduced motion. false for a canvas people read (the stock chart), which keeps
 *   full sharpness and keeps updating.
 * @param {string} [opts.name] - Which canvas (data-name on the div, data-component="canvas"): "blob", "graph"…
 *   Not "animation": that's CanvasScanner's (canvas-scanner.js), which would mount a second one on it.
 */
const withCanvas = (Component, { decorative = true, name } = {}) => {
  const WithCanvasComponent = (props) => {
    const ref = useRef(null);
    const [ sketch, setSketch ] = useState(null);
    useEffect(() => {
      // const rainbow = props.theme.rainbow;
      // c_cls.add(rainbow ? 'linear-gradient' : '').remove(rainbow ? '' : 'linear-gradient');
      let data = null;
      let stopObserver = null;
      let cancelled = false;
      const init = async () => {
        const p5 = (await import("p5")).default;
        if (cancelled) return;
        data = { p5 };
        data.sketch = new p5((p) => data.p = p);
        // The hoc pauses the loop itself (decorativeObserver honours reduced motion), so the Scene doesn't.
        data.canvas = new Scene(data.p, ref.current, { pauseOffscreen: false });
        if (decorative) {
          data.p.pixelDensity(1);
          data.p.frameRate(DECORATIVE_FPS);
          stopObserver = decorativeObserver(data.p, ref.current);
        } else {
          const observer = canvasObserver(data.p, ref.current);
          stopObserver = () => observer.disconnect();
        }
        setSketch(data);
      }
      init();
      return () => {
        cancelled = true;
        stopObserver?.();
        data?.canvas.destroy();
        data?.sketch.remove();
      };
    }, []);
    return (
      <>
        <div data-component="canvas" data-name={name} style={props.style} className={cx(props.className, 'canvas w-100 h-100 overflow-hidden')} ref={ref}></div>
        <Loading require={[sketch]}>
          <Component {...props} canvasRef={ref} sketch={sketch} />
        </Loading>
      </>
    );
  }
  return WithCanvasComponent;
}

// The theme (read only) and a p5 canvas: the canvas animations (components/visuals/canvas.js).
const withThemeCanvas = (Component, opts) => withThemeRead(withCanvas(Component, opts));

export { withTheme, withThemeRead, withCanvas, withThemeCanvas, decorativeObserver, DECORATIVE_FPS }