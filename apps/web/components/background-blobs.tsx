/** Blobs radiales del tema AI Day, fijos detrás del contenido. */
export function BackgroundBlobs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-[12vw] -top-[18vh] size-[52vw] max-h-[760px] max-w-[760px] rounded-full bg-violet opacity-30 blur-[100px]" />
      <div className="absolute -right-[14vw] top-[22vh] size-[42vw] max-h-[620px] max-w-[620px] rounded-full bg-magenta opacity-[0.16] blur-[100px]" />
      <div className="absolute bottom-[-24vh] left-[28vw] size-[46vw] max-h-[680px] max-w-[680px] rounded-full bg-cyan opacity-[0.12] blur-[100px]" />
    </div>
  );
}
