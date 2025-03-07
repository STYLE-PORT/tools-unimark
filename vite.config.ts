import react from "@vitejs/plugin-react-swc";
import {defineConfig} from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./tools-unimark/",
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
});
