type ScrollableTarget = {
  scrollIntoView?: (options?: ScrollIntoViewOptions) => void;
};

/** Remonte le champ dans la zone visible, surtout quand le clavier recouvre le bas de l'écran. */
export function scrollInputIntoView(event: any) {
  const target = (event.nativeEvent?.target ?? event.target) as ScrollableTarget | undefined;
  if (typeof target?.scrollIntoView !== 'function') return;

  const run = () => {
    target.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  };

  run();
  setTimeout(run, 80);
  setTimeout(run, 320);
}
