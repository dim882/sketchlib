export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;

export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60, duration?: number): void {
  const frameDuration = 1000 / fps;
  let lastFrameTime = 0;
  let t = 0;
  let animationId: number | null = null;
  const startTime = Date.now();

  function animate(time: number) {
    if (duration && Date.now() - startTime >= duration) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      return;
    }

    animationId = requestAnimationFrame(animate);

    if (time - lastFrameTime < frameDuration) return;
    lastFrameTime = time;

    render(context, t);
    t++;
  }

  animationId = requestAnimationFrame(animate);
}
