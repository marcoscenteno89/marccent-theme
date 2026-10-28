'use client'
import React, { useEffect, useRef } from "react";
import { withThemeCanvas } from "../theme/hoc";
import {
  Animation, Blob, Fire, Wave, NetworkLoop, ParticleFlowfield, OrbitAnim, Snow, Fireflies, Leaves, Rain, Bubbles, Chart
} from "../../core/canvas";

/*
 * The canvas animations (core/canvas.js, plain JavaScript) as React components: animate(Class) runs one on a
 * withThemeCanvas canvas (hoc.js withCanvas: props.sketch.canvas is a util Scene). The stock chart has its own small
 * wrapper (Graph) since it also takes a ticker. The classes are re-exported, so imports from here keep working.
 */

/**
 * animate: runs an Animation class on a withThemeCanvas canvas, as a React component. The instance is built once (and
 * destroyed on unmount); on every theme change it takes the new theme, becomes the sketch's draw and draws one
 * frame right away, so a paused canvas (off screen, reduced motion) still shows the change. A colors prop (an
 * array of CSS colors) replaces the theme's, read once when it's built.
 * @param {typeof Animation} AnimationClass @param {string} name - Its data-name ("blob").
 */
const animate = (AnimationClass, name) => {
  const Animated = (props) => {
    const { sketch, canvas } = props.sketch;
    const anim = useRef(null);
    useEffect(() => {
      anim.current = new AnimationClass(canvas, props.canvasRef.current, props.colors);
      return () => { anim.current.destroy(); anim.current = null; };
    }, []);
    useEffect(() => {
      const a = anim.current;
      a.theme(props.theme);
      sketch.draw = () => a.draw();
      sketch.draw();
    }, [props.theme, props.theme.version]);
    return null;
  };
  Animated.displayName = AnimationClass.name;
  return withThemeCanvas(Animated, { name });
};

// Graph: a Chart on a withThemeCanvas canvas, with the readout it writes into. Like animate(), plus data() on a new ticker.
const Graph = (props) => {
  const { sketch, canvas } = props.sketch;
  const readout = useRef(null);
  const chart = useRef(null);
  useEffect(() => {
    chart.current = new Chart(canvas, props.canvasRef.current);
    chart.current.readout = readout.current;
    return () => { chart.current.destroy(); chart.current = null; };
  }, []);
  useEffect(() => {
    const c = chart.current;
    c.data(props);
    c.theme(props.theme);
    sketch.draw = () => c.draw();
    sketch.draw();
  }, [props.obj, props.theme, props.theme.version]);
  return <div ref={readout} className="chart-readout order-first" />;
}

const GraphCanvas = withThemeCanvas(Graph, { decorative: false, name: 'graph' }); // a chart people read: full sharpness, no pausing
const BlobCanvas = animate(Blob, 'blob');
const FireCanvas = animate(Fire, 'fire');
const WaveCanvas = animate(Wave, 'wave');
const NetworkLoopCanvas = animate(NetworkLoop, 'network-loop');
const ParticleFlowfieldCanvas = animate(ParticleFlowfield, 'particle-flowfield');
const OrbitAnimCanvas = animate(OrbitAnim, 'orbit');
const SnowCanvas = animate(Snow, 'snow');
const FirefliesCanvas = animate(Fireflies, 'fireflies');
const LeavesCanvas = animate(Leaves, 'leaves');
const RainCanvas = animate(Rain, 'rain');
const BubblesCanvas = animate(Bubbles, 'bubbles');

export {
  ParticleFlowfieldCanvas, OrbitAnimCanvas, BlobCanvas, FireCanvas, NetworkLoopCanvas, WaveCanvas, SnowCanvas,
  FirefliesCanvas, LeavesCanvas, RainCanvas, BubblesCanvas,
  GraphCanvas, Animation, Chart, animate, Blob, Fire, Wave, NetworkLoop, ParticleFlowfield, OrbitAnim, Snow,
  Fireflies, Leaves, Rain, Bubbles
}
