import { defineComponent, mergeProps, withCtx, createVNode, computed, unref, createTextVNode, ref, withKeys, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { d as useAuth, u as useRouter, _ as _export_sfc, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$6 } from './BaseButton-DH6a3c9B.mjs';
import { Video, LogIn } from 'lucide-vue-next';
import { _ as _sfc_main$7 } from './BaseInput-Sb1L-jqw.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';
import 'firebase/auth';

const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "BaseAvatar",
  __ssrInlineRender: true,
  props: {
    name: {},
    size: { default: "md" },
    online: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const initials = computed(() => {
      if (!props.name) return "?";
      return props.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    });
    const sizeClasses = computed(() => {
      switch (props.size) {
        case "sm":
          return "w-8 h-8 text-xs";
        case "md":
          return "w-10 h-10 text-sm";
        case "lg":
          return "w-12 h-12 text-base";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["relative inline-flex items-center justify-center rounded-full bg-frost-blue/20 text-frost-teal font-medium select-none", sizeClasses.value]
      }, _attrs))}><span>${ssrInterpolate(initials.value)}</span>`);
      if (__props.online) {
        _push(`<div class="absolute bottom-0 right-0 w-3 h-3 bg-frost-teal rounded-full border-2 border-slate-900"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BaseAvatar.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "TopBar",
  __ssrInlineRender: true,
  setup(__props) {
    const { user } = useAuth();
    useRouter();
    const userName = computed(() => {
      var _a;
      return ((_a = user.value) == null ? void 0 : _a.displayName) || "User";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseAvatar = _sfc_main$5;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-between h-16 px-6 border-b border-white/10 bg-slate-900" }, _attrs))}><h1 class="text-lg font-semibold text-frost-white">WebRTC</h1><div class="flex items-center gap-3">`);
      _push(ssrRenderComponent(_component_BaseAvatar, {
        name: userName.value,
        size: "sm"
      }, null, _parent));
      _push(`<button class="text-frost-teal hover:text-frost-white text-sm transition-colors"> Sign out </button></div></header>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TopBar.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white/5 border border-white/10 rounded-lg p-6" }, _attrs))}>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BaseCard.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "NewMeetingCard",
  __ssrInlineRender: true,
  setup(__props) {
    function startMeeting() {
      const id = crypto.randomUUID();
      navigateTo(`/room/${id}`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseCard = __nuxt_component_3;
      const _component_BaseButton = _sfc_main$6;
      _push(ssrRenderComponent(_component_BaseCard, mergeProps({ class: "flex flex-col items-center text-center" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-12 h-12 rounded-full bg-frost-blue/20 flex items-center justify-center mb-4"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(Video), { class: "w-6 h-6 text-frost-blue" }, null, _parent2, _scopeId));
            _push2(`</div><h2 class="text-lg font-semibold text-frost-white mb-1"${_scopeId}>New Meeting</h2><p class="text-sm text-frost-teal mb-4"${_scopeId}>Start an instant meeting room</p>`);
            _push2(ssrRenderComponent(_component_BaseButton, { onClick: startMeeting }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Start Meeting`);
                } else {
                  return [
                    createTextVNode("Start Meeting")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "w-12 h-12 rounded-full bg-frost-blue/20 flex items-center justify-center mb-4" }, [
                createVNode(unref(Video), { class: "w-6 h-6 text-frost-blue" })
              ]),
              createVNode("h2", { class: "text-lg font-semibold text-frost-white mb-1" }, "New Meeting"),
              createVNode("p", { class: "text-sm text-frost-teal mb-4" }, "Start an instant meeting room"),
              createVNode(_component_BaseButton, { onClick: startMeeting }, {
                default: withCtx(() => [
                  createTextVNode("Start Meeting")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NewMeetingCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "JoinMeetingCard",
  __ssrInlineRender: true,
  setup(__props) {
    const roomInput = ref("");
    function joinMeeting() {
      const input = roomInput.value.trim();
      if (!input) return;
      const match = input.match(/\/room\/([a-zA-Z0-9-]+)/);
      const roomId = match ? match[1] : input;
      if (roomId) {
        navigateTo(`/room/${roomId}`);
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseCard = __nuxt_component_3;
      const _component_BaseInput = _sfc_main$7;
      const _component_BaseButton = _sfc_main$6;
      _push(ssrRenderComponent(_component_BaseCard, mergeProps({ class: "flex flex-col items-center text-center" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-12 h-12 rounded-full bg-frost-teal/20 flex items-center justify-center mb-4"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(LogIn), { class: "w-6 h-6 text-frost-teal" }, null, _parent2, _scopeId));
            _push2(`</div><h2 class="text-lg font-semibold text-frost-white mb-1"${_scopeId}>Join Meeting</h2><p class="text-sm text-frost-teal mb-4"${_scopeId}>Enter room code or link</p><div class="flex w-full gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_BaseInput, {
              modelValue: roomInput.value,
              "onUpdate:modelValue": ($event) => roomInput.value = $event,
              placeholder: "Paste room code or link",
              onKeyup: joinMeeting
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_BaseButton, { onClick: joinMeeting }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Join`);
                } else {
                  return [
                    createTextVNode("Join")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "w-12 h-12 rounded-full bg-frost-teal/20 flex items-center justify-center mb-4" }, [
                createVNode(unref(LogIn), { class: "w-6 h-6 text-frost-teal" })
              ]),
              createVNode("h2", { class: "text-lg font-semibold text-frost-white mb-1" }, "Join Meeting"),
              createVNode("p", { class: "text-sm text-frost-teal mb-4" }, "Enter room code or link"),
              createVNode("div", { class: "flex w-full gap-2" }, [
                createVNode(_component_BaseInput, {
                  modelValue: roomInput.value,
                  "onUpdate:modelValue": ($event) => roomInput.value = $event,
                  placeholder: "Paste room code or link",
                  onKeyup: withKeys(joinMeeting, ["enter"])
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode(_component_BaseButton, { onClick: joinMeeting }, {
                  default: withCtx(() => [
                    createTextVNode("Join")
                  ]),
                  _: 1
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/JoinMeetingCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TopBar = _sfc_main$4;
      const _component_NewMeetingCard = _sfc_main$2;
      const _component_JoinMeetingCard = _sfc_main$1;
      const _component_BaseCard = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-slate-900" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_TopBar, null, null, _parent));
      _push(`<main class="max-w-4xl mx-auto px-6 py-12"><div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">`);
      _push(ssrRenderComponent(_component_NewMeetingCard, null, null, _parent));
      _push(ssrRenderComponent(_component_JoinMeetingCard, null, null, _parent));
      _push(`</div><section><h2 class="text-sm font-medium text-frost-teal uppercase tracking-wider mb-4">Recent meetings</h2>`);
      _push(ssrRenderComponent(_component_BaseCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p class="text-frost-teal/50 text-sm text-center py-4"${_scopeId}>No recent meetings yet</p>`);
          } else {
            return [
              createVNode("p", { class: "text-frost-teal/50 text-sm text-center py-4" }, "No recent meetings yet")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section></main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CmF2Ijl5.mjs.map
