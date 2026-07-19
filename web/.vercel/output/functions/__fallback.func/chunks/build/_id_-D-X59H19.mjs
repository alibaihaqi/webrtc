import { _ as _sfc_main$8 } from './BaseButton-DH6a3c9B.mjs';
import { defineComponent, ref, watch, computed, mergeProps, unref, withCtx, createVNode, readonly, createTextVNode, nextTick, useSSRContext, createElementBlock, shallowRef, getCurrentInstance, provide, cloneVNode, h } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderSlot, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { MessageSquare, Link, MicOff, Mic, VideoOff, Video, Monitor, PhoneOff, X } from 'lucide-vue-next';
import { _ as _sfc_main$9 } from './BaseInput-Sb1L-jqw.mjs';
import { f as useRoute, u as useRouter, d as useAuth, b as useRuntimeConfig } from './server.mjs';
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

const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "RoomHeader",
  __ssrInlineRender: true,
  props: {
    roomName: {},
    participantCount: {},
    status: {}
  },
  emits: ["copyLink"],
  setup(__props) {
    const props = __props;
    const statusClasses = computed(() => {
      switch (props.status) {
        case "connected":
          return "bg-frost-teal/20 text-frost-teal";
        case "connecting":
          return "bg-frost-blue/20 text-frost-blue";
        case "reconnecting":
          return "bg-frost-red/20 text-frost-red";
        case "error":
          return "bg-frost-red/20 text-frost-red";
        default:
          return "bg-white/10 text-frost-teal/50";
      }
    });
    const dotColor = computed(() => {
      switch (props.status) {
        case "connected":
          return "bg-frost-teal";
        case "connecting":
          return "bg-frost-blue";
        case "reconnecting":
          return "bg-frost-red";
        case "error":
          return "bg-frost-red";
        default:
          return "bg-frost-teal/30";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseButton = _sfc_main$8;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-between h-14 px-4 bg-slate-900/80 backdrop-blur border-b border-white/10" }, _attrs))}><div class="flex items-center gap-3"><h1 class="text-sm font-medium text-frost-white">${ssrInterpolate(__props.roomName)}</h1><span class="text-xs text-frost-teal">${ssrInterpolate(__props.participantCount)} participants</span></div><div class="flex items-center gap-3"><div class="${ssrRenderClass(["flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", statusClasses.value])}"><div class="${ssrRenderClass(["w-2 h-2 rounded-full", dotColor.value])}"></div> ${ssrInterpolate(__props.status)}</div>`);
      _push(ssrRenderComponent(_component_BaseButton, {
        variant: "ghost",
        size: "sm",
        onClick: ($event) => _ctx.$emit("copyLink")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Link), { class: "w-4 h-4 mr-1" }, null, _parent2, _scopeId));
            _push2(` Copy Link `);
          } else {
            return [
              createVNode(unref(Link), { class: "w-4 h-4 mr-1" }),
              createTextVNode(" Copy Link ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></header>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RoomHeader.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "VideoTile",
  __ssrInlineRender: true,
  props: {
    stream: {},
    name: {},
    muted: { type: Boolean },
    placeholder: {}
  },
  setup(__props) {
    const props = __props;
    const videoRef = ref(null);
    watch(() => props.stream, (stream) => {
      if (videoRef.value && stream) {
        videoRef.value.srcObject = stream;
      }
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative bg-gray-900 rounded-lg overflow-hidden" }, _attrs))}><video autoplay${ssrIncludeBooleanAttr(__props.muted) ? " muted" : ""} playsinline class="w-full h-full object-cover"></video><div class="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">${ssrInterpolate(__props.name)}</div>`);
      if (!__props.stream) {
        _push(`<div class="absolute inset-0 flex items-center justify-center"><div class="text-white text-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div><p>${ssrInterpolate(__props.placeholder)}</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VideoTile.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "VideoGrid",
  __ssrInlineRender: true,
  props: {
    localStream: {},
    remoteStream: {},
    remoteName: {}
  },
  setup(__props) {
    const props = __props;
    const gridClasses = computed(() => {
      if (!props.remoteStream) {
        return "flex items-center justify-center h-full p-4";
      }
      return "grid grid-cols-2 gap-4 p-4 h-full";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_VideoTile = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: gridClasses.value }, _attrs))}>`);
      _push(ssrRenderComponent(_component_VideoTile, {
        stream: __props.localStream,
        name: "You",
        muted: true,
        placeholder: "Camera off"
      }, null, _parent));
      if (__props.remoteStream) {
        _push(ssrRenderComponent(_component_VideoTile, {
          stream: __props.remoteStream,
          name: __props.remoteName,
          placeholder: "Waiting for remote participant..."
        }, null, _parent));
      } else {
        _push(`<div class="relative bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center"><div class="text-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-frost-teal mx-auto mb-4"></div><p class="text-frost-teal text-sm">Waiting for remote participant...</p></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VideoGrid.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ReconnectOverlay",
  __ssrInlineRender: true,
  props: {
    isReconnecting: { type: Boolean },
    attempt: {},
    maxAttempts: {}
  },
  emits: ["giveUp"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.isReconnecting) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black/80 flex items-center justify-center z-50" }, _attrs))}><div class="text-center"><div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div><h2 class="text-xl font-semibold text-white mb-2">Reconnecting...</h2><p class="text-gray-400">Attempt ${ssrInterpolate(__props.attempt)} of ${ssrInterpolate(__props.maxAttempts)}</p>`);
        if (__props.attempt >= __props.maxAttempts) {
          _push(`<button class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"> End Call </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReconnectOverlay.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "RoomFooter",
  __ssrInlineRender: true,
  props: {
    isMuted: { type: Boolean },
    isVideoOff: { type: Boolean }
  },
  emits: ["toggleMute", "toggleVideo", "hangup"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center gap-3 h-16 bg-slate-900/80 backdrop-blur border-t border-white/10 px-4" }, _attrs))}><button class="${ssrRenderClass(["w-10 h-10 rounded-full flex items-center justify-center transition-colors", __props.isMuted ? "bg-frost-red text-white" : "bg-white/10 text-frost-white hover:bg-white/20"])}"${ssrRenderAttr("title", __props.isMuted ? "Unmute" : "Mute")}>`);
      if (__props.isMuted) {
        _push(ssrRenderComponent(unref(MicOff), { class: "w-5 h-5" }, null, _parent));
      } else {
        _push(ssrRenderComponent(unref(Mic), { class: "w-5 h-5" }, null, _parent));
      }
      _push(`</button><button class="${ssrRenderClass(["w-10 h-10 rounded-full flex items-center justify-center transition-colors", __props.isVideoOff ? "bg-frost-red text-white" : "bg-white/10 text-frost-white hover:bg-white/20"])}"${ssrRenderAttr("title", __props.isVideoOff ? "Turn on camera" : "Turn off camera")}>`);
      if (__props.isVideoOff) {
        _push(ssrRenderComponent(unref(VideoOff), { class: "w-5 h-5" }, null, _parent));
      } else {
        _push(ssrRenderComponent(unref(Video), { class: "w-5 h-5" }, null, _parent));
      }
      _push(`</button><button class="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-frost-white hover:bg-white/20 transition-colors opacity-50 cursor-not-allowed" title="Screen share (coming soon)" disabled>`);
      _push(ssrRenderComponent(unref(Monitor), { class: "w-5 h-5" }, null, _parent));
      _push(`</button><button class="w-12 h-12 rounded-full flex items-center justify-center bg-frost-red text-white hover:bg-frost-red/80 transition-colors ml-2" title="End call">`);
      _push(ssrRenderComponent(unref(PhoneOff), { class: "w-5 h-5" }, null, _parent));
      _push(`</button><div class="w-px h-6 bg-white/10 mx-2"></div>`);
      ssrRenderSlot(_ctx.$slots, "right-controls", {}, null, _push, _parent);
      _push(`</footer>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RoomFooter.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BaseToast",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean },
    message: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.show) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed bottom-24 left-1/2 -translate-x-1/2 bg-frost-blue text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium" }, _attrs))}>${ssrInterpolate(__props.message)}</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BaseToast.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const messages = ref([]);
const isOpen = ref(false);
function useChat() {
  function toggle() {
    isOpen.value = !isOpen.value;
  }
  function sendMessage(text, senderId, senderName) {
    if (!text.trim()) return;
    const msg = {
      id: crypto.randomUUID(),
      senderId,
      senderName,
      text: text.trim(),
      timestamp: Date.now()
    };
    messages.value.push(msg);
    (void 0).dispatchEvent(new CustomEvent("chat-send", { detail: msg }));
  }
  return { messages, isOpen, toggle, sendMessage };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ChatSidebar",
  __ssrInlineRender: true,
  setup(__props) {
    const { messages: messages2, isOpen: isOpen2, sendMessage } = useChat();
    const { user } = useAuth();
    const newMessage = ref("");
    const messagesContainer = ref(null);
    function handleSend() {
      var _a, _b;
      if (!newMessage.value.trim()) return;
      sendMessage(
        newMessage.value,
        ((_a = user.value) == null ? void 0 : _a.uid) || "anonymous",
        ((_b = user.value) == null ? void 0 : _b.displayName) || "User"
      );
      newMessage.value = "";
    }
    function formatTime(ts) {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    watch(messages2, async () => {
      await nextTick();
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    }, { deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseInput = _sfc_main$9;
      if (unref(isOpen2)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-80 h-full bg-slate-900/95 backdrop-blur border-l border-white/10 flex flex-col" }, _attrs))}><div class="flex items-center justify-between px-4 h-12 border-b border-white/10"><span class="text-sm font-medium text-frost-white">Chat</span><button class="text-frost-teal hover:text-frost-white transition-colors">`);
        _push(ssrRenderComponent(unref(X), { class: "w-4 h-4" }, null, _parent));
        _push(`</button></div><div class="flex-1 overflow-y-auto px-4 py-3 space-y-3">`);
        if (unref(messages2).length === 0) {
          _push(`<div class="text-center text-frost-teal/50 text-sm py-8"> No messages yet </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(messages2), (msg) => {
          _push(`<div class="flex flex-col"><div class="flex items-baseline gap-2"><span class="text-xs font-medium text-frost-teal">${ssrInterpolate(msg.senderName)}</span><span class="text-xs text-frost-teal/30">${ssrInterpolate(formatTime(msg.timestamp))}</span></div><p class="text-sm text-frost-white mt-0.5">${ssrInterpolate(msg.text)}</p></div>`);
        });
        _push(`<!--]--></div><div class="px-3 pb-3"><div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_BaseInput, {
          modelValue: newMessage.value,
          "onUpdate:modelValue": ($event) => newMessage.value = $event,
          placeholder: "Type a message...",
          onKeyup: handleSend
        }, null, _parent));
        _push(`<button${ssrIncludeBooleanAttr(!newMessage.value.trim()) ? " disabled" : ""} class="px-3 py-2 bg-frost-blue text-white rounded-lg text-sm font-medium hover:bg-frost-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> Send </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChatSidebar.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
function useMedia() {
  const localStream = ref(null);
  const error = ref(null);
  const isMuted = ref(false);
  const isVideoOff = ref(false);
  const devices = ref([]);
  const activeCameraId = ref("");
  const activeMicrophoneId = ref("");
  async function enumerateDevices() {
    try {
      const allDevices = await (void 0).mediaDevices.enumerateDevices();
      devices.value = allDevices.filter((d) => d.kind === "videoinput" || d.kind === "audioinput");
    } catch (e) {
      console.error("Failed to enumerate devices:", e);
    }
  }
  async function getMedia(constraints) {
    var _a, _b;
    error.value = null;
    const video = (_a = constraints == null ? void 0 : constraints.video) != null ? _a : true;
    const audio = (_b = constraints == null ? void 0 : constraints.audio) != null ? _b : true;
    try {
      const stream = await (void 0).mediaDevices.getUserMedia({ video, audio });
      localStream.value = stream;
      trackActiveDevices(stream);
      await enumerateDevices();
      return stream;
    } catch {
    }
    if (audio) {
      try {
        const stream = await (void 0).mediaDevices.getUserMedia({ video, audio: false });
        localStream.value = stream;
        trackActiveDevices(stream);
        await enumerateDevices();
        return stream;
      } catch {
      }
    }
    if (video) {
      try {
        const stream = await (void 0).mediaDevices.getUserMedia({ video: false, audio });
        localStream.value = stream;
        trackActiveDevices(stream);
        await enumerateDevices();
        return stream;
      } catch {
      }
    }
    error.value = "No camera or microphone found";
    return null;
  }
  function trackActiveDevices(stream) {
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    if (videoTrack) activeCameraId.value = videoTrack.getSettings().deviceId || "";
    if (audioTrack) activeMicrophoneId.value = audioTrack.getSettings().deviceId || "";
  }
  async function switchCamera(deviceId) {
    if (!localStream.value) return false;
    try {
      const stream = await (void 0).mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false
      });
      const newVideoTrack = stream.getVideoTracks()[0];
      const oldVideoTrack = localStream.value.getVideoTracks()[0];
      if (oldVideoTrack) {
        localStream.value.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      localStream.value.addTrack(newVideoTrack);
      activeCameraId.value = deviceId;
      (void 0).dispatchEvent(new CustomEvent("track-replaced", {
        detail: { kind: "video", track: newVideoTrack }
      }));
      return true;
    } catch (e) {
      console.error("Failed to switch camera:", e);
      return false;
    }
  }
  async function switchMicrophone(deviceId) {
    if (!localStream.value) return false;
    try {
      const stream = await (void 0).mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId: { exact: deviceId } }
      });
      const newAudioTrack = stream.getAudioTracks()[0];
      const oldAudioTrack = localStream.value.getAudioTracks()[0];
      if (oldAudioTrack) {
        localStream.value.removeTrack(oldAudioTrack);
        oldAudioTrack.stop();
      }
      localStream.value.addTrack(newAudioTrack);
      activeMicrophoneId.value = deviceId;
      (void 0).dispatchEvent(new CustomEvent("track-replaced", {
        detail: { kind: "audio", track: newAudioTrack }
      }));
      return true;
    } catch (e) {
      console.error("Failed to switch microphone:", e);
      return false;
    }
  }
  function toggleMute() {
    if (localStream.value) {
      const audioTrack = localStream.value.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        isMuted.value = !audioTrack.enabled;
      }
    }
  }
  function toggleVideo() {
    if (localStream.value) {
      const videoTrack = localStream.value.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        isVideoOff.value = !videoTrack.enabled;
      }
    }
  }
  function cleanup() {
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => track.stop());
      localStream.value = null;
    }
  }
  return {
    localStream,
    error,
    isMuted,
    isVideoOff,
    getMedia,
    toggleMute,
    toggleVideo,
    cleanup,
    devices: readonly(devices),
    activeCameraId: readonly(activeCameraId),
    activeMicrophoneId: readonly(activeMicrophoneId),
    switchCamera,
    switchMicrophone
  };
}
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = /* @__PURE__ */ Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  ...false,
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      var _a;
      if (mounted.value) {
        const vnodes = (_a = slots.default) == null ? void 0 : _a.call(slots);
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
function useWebRTC(iceConfig) {
  const { localStream, error: mediaError, getMedia, cleanup: cleanupMedia, toggleMute, toggleVideo, isMuted, isVideoOff } = useMedia();
  const connectionState = ref("new");
  const iceState = ref("new");
  const remoteStream = ref(null);
  const error = ref(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 3;
  const reconnectDelay = 2e3;
  const ICE_RESTART_MAX_ATTEMPTS = 3;
  const iceRestartAttempts = ref(0);
  let peerConnection = null;
  const pendingCandidates = [];
  async function fetchTurnCredentials() {
    try {
      const config = useRuntimeConfig();
      const response = await fetch(`${config.public.apiUrl}/turn-credentials`);
      const data = await response.json();
      return [{
        urls: data.urls,
        username: data.username,
        credential: data.credential
      }];
    } catch (e) {
      console.error("Failed to fetch TURN credentials:", e);
      return [];
    }
  }
  function replaceTrack(kind, newTrack) {
    if (!peerConnection) return;
    const sender = peerConnection.getSenders().find(
      (s) => {
        var _a;
        return ((_a = s.track) == null ? void 0 : _a.kind) === kind;
      }
    );
    if (sender) {
      sender.replaceTrack(newTrack).then(() => console.log(`${kind} track replaced successfully`)).catch((e) => console.error(`Failed to replace ${kind} track:`, e));
    }
  }
  function setupTrackReplacement() {
    (void 0).addEventListener("track-replaced", ((event) => {
      const { kind, track } = event.detail;
      replaceTrack(kind, track);
    }));
  }
  async function createPeerConnection() {
    const turnServers = await fetchTurnCredentials();
    peerConnection = new RTCPeerConnection({
      ...iceConfig,
      iceServers: [
        ...[],
        ...turnServers
      ]
    });
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateEvent = new CustomEvent("ice-candidate", { detail: event.candidate });
        (void 0).dispatchEvent(candidateEvent);
      }
    };
    peerConnection.ontrack = (event) => {
      remoteStream.value = event.streams[0];
    };
    peerConnection.onconnectionstatechange = () => {
      connectionState.value = peerConnection == null ? void 0 : peerConnection.connectionState;
    };
    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection == null ? void 0 : peerConnection.iceConnectionState;
      iceState.value = state;
      if (state === "failed" || state === "disconnected") {
        console.log(`ICE connection ${state}, attempting restart`);
        iceRestart().then((success) => {
          if (!success) {
            error.value = "ICE connection failed, reconnecting...";
            (void 0).dispatchEvent(new CustomEvent("ice-reconnect-needed"));
          }
        });
      }
      if (state === "connected" || state === "completed") {
        iceRestartAttempts.value = 0;
      }
    };
    setupTrackReplacement();
    return peerConnection;
  }
  async function attemptReconnect() {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      error.value = "Failed to reconnect after maximum attempts";
      return false;
    }
    reconnectAttempts.value++;
    connectionState.value = "reconnecting";
    try {
      await new Promise((resolve) => setTimeout(resolve, reconnectDelay * reconnectAttempts.value));
      const stream = await getMedia();
      if (!stream) {
        error.value = "Failed to get media for reconnection";
        return false;
      }
      if (peerConnection) {
        peerConnection.close();
      }
      await createPeerConnection();
      stream.getTracks().forEach((track) => {
        peerConnection == null ? void 0 : peerConnection.addTrack(track, stream);
      });
      connectionState.value = "signaling";
      return true;
    } catch (e) {
      error.value = "Reconnection failed";
      return false;
    }
  }
  async function iceRestart() {
    if (iceRestartAttempts.value >= ICE_RESTART_MAX_ATTEMPTS) {
      console.log("Max ICE restart attempts reached, falling back to full reconnect");
      return false;
    }
    if (!peerConnection) return false;
    iceRestartAttempts.value++;
    console.log(`ICE restart attempt ${iceRestartAttempts.value}/${ICE_RESTART_MAX_ATTEMPTS}`);
    try {
      const offer = await peerConnection.createOffer({ iceRestart: true });
      await peerConnection.setLocalDescription(offer);
      (void 0).dispatchEvent(new CustomEvent("ice-restart-offer", { detail: offer }));
      return true;
    } catch (e) {
      console.error("ICE restart failed:", e);
      return false;
    }
  }
  function resetReconnectAttempts() {
    reconnectAttempts.value = 0;
  }
  async function createOffer() {
    connectionState.value = "signaling";
    if (!peerConnection) await createPeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }
  async function handleAnswer(answer) {
    if (!peerConnection) await createPeerConnection();
    await peerConnection.setRemoteDescription(answer);
  }
  async function addIceCandidate(candidate) {
    if (!peerConnection) await createPeerConnection();
    if (peerConnection.remoteDescription) {
      await peerConnection.addIceCandidate(candidate);
    } else {
      pendingCandidates.push(candidate);
    }
  }
  async function flushPendingCandidates() {
    if (peerConnection == null ? void 0 : peerConnection.remoteDescription) {
      for (const candidate of pendingCandidates) {
        await peerConnection.addIceCandidate(candidate);
      }
      pendingCandidates.length = 0;
    }
  }
  function addLocalTrack(track, stream) {
    peerConnection == null ? void 0 : peerConnection.addTrack(track, stream);
  }
  async function hangup() {
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    connectionState.value = "closed";
    remoteStream.value = null;
    pendingCandidates.length = 0;
    cleanupMedia();
  }
  function cleanup() {
    hangup();
  }
  return {
    connectionState: readonly(connectionState),
    iceState: readonly(iceState),
    localStream,
    remoteStream: readonly(remoteStream),
    error,
    mediaError,
    getMedia,
    createOffer,
    handleAnswer,
    addIceCandidate,
    flushPendingCandidates,
    addLocalTrack,
    hangup,
    cleanup,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoOff,
    reconnectAttempts: readonly(reconnectAttempts),
    maxReconnectAttempts,
    attemptReconnect,
    resetReconnectAttempts,
    iceRestartAttempts: readonly(iceRestartAttempts),
    iceRestart,
    replaceTrack
  };
}
const RECONNECT_MAX_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY = 1e3;
const RECONNECT_MAX_DELAY = 16e3;
function useSignaling(signalConnectionState) {
  const isConnected = ref(false);
  const error = ref(null);
  const lastMessage = ref(null);
  const reconnecting = ref(false);
  const reconnectAttempts = ref(0);
  const reconnectFailed = ref(false);
  const reconnectTimer = ref(null);
  let ws = null;
  let userInitiatedClose = false;
  function initWebSocket(roomId, userId, displayName) {
    const config = useRuntimeConfig();
    const wsUrl = config.public.wsUrl;
    ws = new WebSocket(`${wsUrl}?roomId=${roomId}&userId=${userId}&displayName=${encodeURIComponent(displayName)}`);
    ws.onopen = () => {
      isConnected.value = true;
      reconnecting.value = false;
      reconnectAttempts.value = 0;
      reconnectFailed.value = false;
      cleanupReconnectTimer();
      console.log("WebSocket connected");
    };
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        lastMessage.value = message;
        (void 0).dispatchEvent(new CustomEvent("signaling-message", { detail: message }));
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    };
    ws.onclose = () => {
      isConnected.value = false;
      console.log("WebSocket disconnected");
      if (reconnectAttempts.value < RECONNECT_MAX_ATTEMPTS && !userInitiatedClose) {
        reconnecting.value = true;
        const baseDelay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts.value);
        const delay = Math.min(
          baseDelay * (0.8 + Math.random() * 0.4),
          RECONNECT_MAX_DELAY
        );
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value + 1}/${RECONNECT_MAX_ATTEMPTS})`);
        reconnectTimer.value = setTimeout(() => {
          reconnectAttempts.value++;
          initWebSocket(roomId, userId, displayName);
        }, delay);
      } else {
        reconnecting.value = false;
        if (reconnectAttempts.value >= RECONNECT_MAX_ATTEMPTS) {
          reconnectFailed.value = true;
        }
      }
    };
    ws.onerror = (e) => {
      error.value = "WebSocket error";
      console.error("WebSocket error:", e);
    };
  }
  function connect(roomId, userId, displayName) {
    userInitiatedClose = false;
    reconnectAttempts.value = 0;
    reconnectFailed.value = false;
    cleanupReconnectTimer();
    initWebSocket(roomId, userId, displayName);
  }
  function send(message) {
    if ((ws == null ? void 0 : ws.readyState) === WebSocket.OPEN) {
      ws.send(JSON.stringify({ ...message, timestamp: Date.now() }));
    }
  }
  function cleanupReconnectTimer() {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value);
      reconnectTimer.value = null;
    }
  }
  function disconnect() {
    userInitiatedClose = true;
    cleanupReconnectTimer();
    if (ws) {
      ws.close();
      ws = null;
    }
    isConnected.value = false;
    reconnecting.value = false;
    reconnectFailed.value = false;
  }
  return {
    isConnected,
    error,
    lastMessage,
    reconnecting: readonly(reconnecting),
    reconnectAttempts: readonly(reconnectAttempts),
    reconnectFailed: readonly(reconnectFailed),
    connect,
    send,
    disconnect
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const roomId = route.params.id;
    const { user } = useAuth();
    const {
      connectionState,
      localStream,
      remoteStream,
      error: webrtcError,
      hangup,
      toggleMute,
      toggleVideo,
      isMuted,
      isVideoOff
    } = useWebRTC();
    const {
      error: signalingError,
      send,
      disconnect
    } = useSignaling();
    const { isOpen: isChatOpen, toggle: toggleChat } = useChat();
    const participantCount = ref(1);
    const remoteName = ref("Remote");
    const reconnectAttempt = ref(0);
    const showToast = ref(false);
    watch(connectionState, (state) => {
      if (state === "reconnecting") reconnectAttempt.value++;
      else if (state === "connected") reconnectAttempt.value = 0;
    });
    const connectionStatus = computed(() => {
      if (webrtcError.value || signalingError.value) return "error";
      if (connectionState.value === "connected") return "connected";
      if (connectionState.value === "connecting" || connectionState.value === "signaling") return "connecting";
      if (connectionState.value === "reconnecting") return "reconnecting";
      return "idle";
    });
    const error = computed(() => webrtcError.value || signalingError.value);
    function handleHangup() {
      var _a;
      send({ type: "leave-room", roomId, from: ((_a = user.value) == null ? void 0 : _a.uid) || "anonymous" });
      hangup();
      disconnect();
      router.push("/");
    }
    function copyInviteLink() {
      const url = `${(void 0).location.origin}/room/${roomId}`;
      (void 0).clipboard.writeText(url);
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 2e3);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_RoomHeader = _sfc_main$7;
      const _component_VideoGrid = _sfc_main$5;
      const _component_ReconnectOverlay = _sfc_main$4;
      const _component_RoomFooter = _sfc_main$3;
      const _component_BaseToast = _sfc_main$2;
      const _component_ChatSidebar = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-screen flex flex-col bg-slate-900" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_RoomHeader, {
        "room-name": unref(roomId),
        "participant-count": participantCount.value,
        status: connectionStatus.value,
        onCopyLink: copyInviteLink
      }, null, _parent));
      _push(`<div class="flex-1 overflow-hidden relative">`);
      _push(ssrRenderComponent(_component_VideoGrid, {
        "local-stream": unref(localStream),
        "remote-stream": unref(remoteStream),
        "remote-name": remoteName.value
      }, null, _parent));
      _push(ssrRenderComponent(_component_ReconnectOverlay, {
        "is-reconnecting": unref(connectionState) === "reconnecting",
        attempt: reconnectAttempt.value,
        "max-attempts": 3,
        onGiveUp: handleHangup
      }, null, _parent));
      if (error.value) {
        _push(`<div class="fixed bottom-20 left-1/2 -translate-x-1/2 bg-frost-red text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_RoomFooter, {
        "is-muted": unref(isMuted),
        "is-video-off": unref(isVideoOff),
        onToggleMute: unref(toggleMute),
        onToggleVideo: unref(toggleVideo),
        onHangup: handleHangup
      }, {
        "right-controls": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="${ssrRenderClass(["w-10 h-10 rounded-full flex items-center justify-center transition-colors", unref(isChatOpen) ? "bg-frost-blue text-white" : "bg-white/10 text-frost-white hover:bg-white/20"])}" title="Chat"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(MessageSquare), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: unref(toggleChat),
                class: ["w-10 h-10 rounded-full flex items-center justify-center transition-colors", unref(isChatOpen) ? "bg-frost-blue text-white" : "bg-white/10 text-frost-white hover:bg-white/20"],
                title: "Chat"
              }, [
                createVNode(unref(MessageSquare), { class: "w-5 h-5" })
              ], 10, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_BaseToast, {
        show: showToast.value,
        message: "Link copied to clipboard!"
      }, null, _parent));
      _push(ssrRenderComponent(_component_ChatSidebar, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/room/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-D-X59H19.mjs.map
