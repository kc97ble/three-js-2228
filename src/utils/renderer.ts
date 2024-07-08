import * as Ʒ from "three";

function resizeRenderer(
  renderer: Ʒ.WebGLRenderer,
  canvas: HTMLCanvasElement,
  aspect: number
) {
  const area = Math.min(
    (canvas.clientWidth * canvas.clientWidth) / aspect,
    canvas.clientHeight * canvas.clientHeight * aspect
  );
  const width = Math.sqrt(area * aspect);
  const height = Math.sqrt(area / aspect);
  renderer.setSize(
    width * window.devicePixelRatio,
    height * window.devicePixelRatio
  );
}

export function createRenderer(canvas: HTMLCanvasElement, aspect: number) {
  const renderer = new Ʒ.WebGLRenderer({ canvas, alpha: true });
  resizeRenderer(renderer, canvas, aspect);

  window.addEventListener("resize", () => {
    resizeRenderer(renderer, canvas, aspect);
  });

  return renderer;
}
