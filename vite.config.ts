import { defineConfig, loadEnv } from 'vite';

// To preview the built site from another device, list extra host names in an
// untracked .env.local file:  PREVIEW_ALLOWED_HOSTS=.example.lan,.example.net
export default defineConfig(({ mode }) => {
  const hosts = (loadEnv(mode, process.cwd(), '').PREVIEW_ALLOWED_HOSTS ?? '').split(',').map((h) => h.trim()).filter(Boolean);
  return { preview: { allowedHosts: hosts } };
});
