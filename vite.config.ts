import react from "@vitejs/plugin-react-swc";
import {defineConfig} from "vite";

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  return {
    plugins: [react()],
    base: mode === 'production' ? '/tools-unimark/' : '/',
    css: {
      modules: {
        localsConvention: 'camelCaseOnly'
      }
    }
  };
});
