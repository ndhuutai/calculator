import { getBabelOutputPlugin } from "@rollup/plugin-babel";

export default {
  input: "src/utils.js",
  watch: {
    include: ["./src/**"],
  },
  output: [
    {
      file: "lib/bundle.es5.js",
      format: "esm",
      plugins: [getBabelOutputPlugin({ presets: ["@babel/preset-env"] })],
    },
  ],
};
