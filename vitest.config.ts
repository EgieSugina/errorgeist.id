import type { Plugin, PluginOption, ViteDevServer } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

// @stylexjs/unplugin starts a setInterval in configureServer and only clears it
// when server.httpServer closes. Vitest's server has no httpServer, so the timer
// leaks and every run hangs 10s on "close timed out". Clear it on server close.
function clearStylexIntervalOnClose(p: PluginOption): PluginOption {
  if (!p || typeof p !== 'object' || Array.isArray(p) || !('name' in p)) return p;
  const plugin = p as Plugin;
  const hook = plugin.configureServer;
  if (plugin.name !== '@stylexjs/unplugin' || typeof hook !== 'function') return p;
  return {
    ...plugin,
    configureServer(this: unknown, server: ViteDevServer) {
      const timers: ReturnType<typeof setInterval>[] = [];
      const realSetInterval = globalThis.setInterval;
      globalThis.setInterval = ((...args: Parameters<typeof setInterval>) => {
        const t = realSetInterval(...args);
        timers.push(t);
        return t;
      }) as typeof setInterval;
      try {
        return (hook as (this: unknown, s: ViteDevServer) => unknown).call(this, server);
      } finally {
        globalThis.setInterval = realSetInterval;
        const close = server.close.bind(server);
        server.close = async () => {
          timers.forEach(clearInterval);
          return close();
        };
      }
    },
  } as Plugin;
}

export default mergeConfig(
  { ...viteConfig, plugins: (viteConfig.plugins ?? []).map(clearStylexIntervalOnClose) },
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['tests/unit/**/*.test.{ts,tsx}'],
      setupFiles: ['tests/setup.ts'],
    },
  }),
);
