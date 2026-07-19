import { _ as _sfc_main$1 } from './BaseButton-DH6a3c9B.mjs';
import { defineComponent, mergeProps, unref, withCtx, openBlock, createBlock, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { d as useAuth, u as useRouter } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const { signInWithGoogle, loading } = useAuth();
    const router = useRouter();
    async function handleSignIn() {
      try {
        await signInWithGoogle();
        router.push("/");
      } catch (error) {
        console.error("Sign in failed:", error);
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-slate-900 flex items-center justify-center" }, _attrs))}><div class="max-w-md w-full space-y-8 px-6"><div class="text-center"><h1 class="text-3xl font-bold text-frost-white">WebRTC</h1><p class="mt-2 text-frost-teal">Sign in to start a call</p></div>`);
      _push(ssrRenderComponent(_component_BaseButton, {
        onClick: handleSignIn,
        disabled: unref(loading),
        size: "lg",
        class: "w-full"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(loading)) {
              _push2(`<span${_scopeId}>Signing in...</span>`);
            } else {
              _push2(`<span class="flex items-center gap-2"${_scopeId}><svg class="w-5 h-5" viewBox="0 0 24 24"${_scopeId}><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"${_scopeId}></path><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"${_scopeId}></path><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"${_scopeId}></path><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"${_scopeId}></path></svg> Sign in with Google </span>`);
            }
          } else {
            return [
              unref(loading) ? (openBlock(), createBlock("span", { key: 0 }, "Signing in...")) : (openBlock(), createBlock("span", {
                key: 1,
                class: "flex items-center gap-2"
              }, [
                (openBlock(), createBlock("svg", {
                  class: "w-5 h-5",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    fill: "currentColor",
                    d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  }),
                  createVNode("path", {
                    fill: "currentColor",
                    d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  }),
                  createVNode("path", {
                    fill: "currentColor",
                    d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  }),
                  createVNode("path", {
                    fill: "currentColor",
                    d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  })
                ])),
                createTextVNode(" Sign in with Google ")
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-DsVrPX-S.mjs.map
