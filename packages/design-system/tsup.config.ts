import { defineConfig } from "tsup";
import { vanillaExtractPlugin } from "@vanilla-extract/esbuild-plugin";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "lib",
  //@ts-ignore
  esbuildPlugins: [vanillaExtractPlugin()],
  dts: true,
  // See https://esbuild.github.io/content-types/#auto-import-for-jsx
  inject: ["./jsxShim.ts"],
  // Include here the css files coming from external dependencies, which we
  // recommend to bundle in your design system package.
  noExternal: [
    "@buildo/bento-design-system/lib/index.css",
    "@buildo/bento-design-system/lib/defaultTheme.css"
    // e.g. here's how to include fonts from Fontsource, a popular library for self-hosting fonts
    // "@fontsource",

    // Uncomment the next line if you want to bundle all css files coming from external dependencies
    // NOTE: this may significantly slow down your build, depending on your setup.
    // /\.css$/,
  ],
});
