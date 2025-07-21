import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: "0.0.0.0", // 로컬 네트워크에서 접근 가능하도록 설정
    strictPort: true, // 포트가 사용 중이면 에러 발생
    // 개발용으로 HTTP 사용 (카메라는 localhost에서만 작동)
    // https: {
    //   // 자체 서명된 인증서 사용 (개발용)
    // },
  },
});
