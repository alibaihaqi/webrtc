import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BaseButton",
  __ssrInlineRender: true,
  props: {
    variant: { default: "primary" },
    size: { default: "md" },
    disabled: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const sizeClasses = computed(() => {
      switch (props.size) {
        case "sm":
          return "px-3 py-1.5 text-sm rounded-md";
        case "md":
          return "px-4 py-2 text-sm rounded-lg";
        case "lg":
          return "px-6 py-3 text-base rounded-lg";
      }
    });
    const variantClasses = computed(() => {
      switch (props.variant) {
        case "primary":
          return "bg-frost-blue text-white hover:bg-frost-blue/80 focus:ring-frost-blue";
        case "danger":
          return "bg-frost-red text-white hover:bg-frost-red/80 focus:ring-frost-red";
        case "ghost":
          return "bg-transparent text-frost-teal hover:bg-white/10 focus:ring-frost-teal";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${ssrRenderAttrs(mergeProps({
        class: [
          "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-frost-blue disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses.value,
          variantClasses.value
        ],
        disabled: __props.disabled
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</button>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BaseButton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=BaseButton-DH6a3c9B.mjs.map
