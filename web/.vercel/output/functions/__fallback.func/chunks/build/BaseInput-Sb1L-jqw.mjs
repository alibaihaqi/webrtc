import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BaseInput",
  __ssrInlineRender: true,
  props: {
    modelValue: { default: "" },
    placeholder: { default: "" }
  },
  emits: ["update:modelValue"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<input${ssrRenderAttrs(mergeProps({
        value: __props.modelValue,
        placeholder: __props.placeholder,
        class: "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-frost-white placeholder-frost-teal/50 focus:outline-none focus:ring-2 focus:ring-frost-blue focus:border-transparent transition-colors"
      }, _attrs))}>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BaseInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=BaseInput-Sb1L-jqw.mjs.map
