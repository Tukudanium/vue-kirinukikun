import type { HideAll, Props } from "tippy.js";
import type ToolTip from "./ToolTip.vue";

export type PluginOptions = Partial<Props>;
export * from "./index";

declare module "vue" {
  // tells Vue about a custom global property/method
  interface ComponentCustomProperties {
    $hideAllTooltips: HideAll;
  }
  // tells Vue about a custom component registered globally in the plugin
  interface GlobalComponents {
    ToolTip: typeof ToolTip;
  }
}