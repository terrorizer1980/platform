(window as any).global = window;
(window as any).process = {};
(window as any).process.nextTick = setTimeout;
