import { createApp } from "vue";

// TODO: 3. change data format
const HELP_HEADER = ["Title and description (html, <h1> on plain text)"];
const HELP_PART = ["Data (html)"];
const DEFAULT_VALUES = {
  // TODO: 5. implement custom logic
  header: "",
  data: [],
};

const utils = {
  base64URLTobase64(str) {
    const base64Encoded = str.replace(/-/gu, "+").replace(/_/gu, "/");
    const padding =
      str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
    return base64Encoded + padding;
  },
  base64tobase64URL(str) {
    return str.replace(/\+/gu, "-").replace(/\//gu, "_").replace(/[=]+$/u, "");
  },
  decodeData(str) {
    return LZString.decompressFromBase64(
      utils.base64URLTobase64(str.split("").reverse().join(""))
    );
  },
  encodeData(str) {
    return utils
      .base64tobase64URL(LZString.compressToBase64(str))
      .split("")
      .reverse()
      .join("");
  },
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
};

const app = createApp({
  data() {
    return {
      debug: true,
      // TODO: 4. change sample
      debugData:
        "Url encoded app template\n<i>Italic text</i>\n<b>Bold text</b>\n<pre>code text</pre>\n<a href='https://google.com'>link</a>",
      debugUrl: "",
      editor: {
        numbersCols: 0,
        numbersText: "",
        overlayText: "",
      },
      parsed: DEFAULT_VALUES,
    };
  },
  computed: {},
  watch: {
    debugData(value) {
      this.readZData(value);
      this.updateEditor(value);
      this.updateDebugUrl(value);
    },
  },
  beforeMount() {
    this.initApp();
  },
  mounted() {
    setTimeout(this.showApp);
    this.updateIcons();
  },
  updated() {
    this.updateIcons();
  },
  methods: {
    showApp() {
      document.getElementById("app").setAttribute("style", "");
    },
    initApp() {
      const url = new URL(window.location);
      if (url.searchParams.get("z") !== null) {
        this.debug = this.readZData(
          utils.decodeData(url.searchParams.get("z"))
        );
      }
      if (this.debug) {
        this.readZData(this.debugData);
        this.updateEditor(this.debugData);
        this.updateDebugUrl(this.debugData);
      }
    },
    updateIcons() {
      lucide.createIcons({
        nameAttr: "icon",
        attrs: {
          width: "1.1em",
          height: "1.1em",
        },
      });
    },
    updateDebugUrl(value) {
      this.debugUrl = value.trim().length
        ? `${window.location.pathname}?z=${utils.encodeData(value.trim())}`
        : "";
    },
    updateEditor(value) {
      const debugDataSplit = value.split("\n");
      let size = HELP_HEADER.length + HELP_PART.length;
      while (debugDataSplit.length > size) {
        size += HELP_PART.length;
      }
      const lines = Array(size).fill(0);
      this.editor.numbersText = debugDataSplit
        .map((_value, index) => `${index + 1}.`)
        .join("\n");
      this.editor.overlayText = lines
        .map((_value, index) => {
          if (
            debugDataSplit.length > index &&
            debugDataSplit[index].trim().length
          ) {
            return " ".repeat(debugDataSplit[index].length);
          }
          if (HELP_HEADER.length > index) {
            return HELP_HEADER[index];
          }
          return HELP_PART[(index - HELP_HEADER.length) % HELP_PART.length];
        })
        .join("\n");
      this.editor.numbersCols =
        this.editor.numbersText.length.toString().length + 1;
    },
    editorScroll() {
      this.$refs.numbers.scrollTop = this.$refs.code.scrollTop;
      this.$refs.overlay.scrollTop = this.$refs.code.scrollTop;
      this.$refs.overlay.scrollLeft = this.$refs.code.scrollLeft;
    },
    readZData(str) {
      // TODO: 5. implement custom logic
      this.debugData = str;
      this.parsed = utils.clone(DEFAULT_VALUES);
      const parts = str.split("\n");
      if (parts.length < 1) {
        return true;
      }
      this.parsed.header = parts.shift();
      if (!/<[^>]*>/u.test(this.parsed.header)) {
        this.parsed.header = `<h1>${this.parsed.header}</h1>`;
      }
      this.parsed.data = [];
      while (parts.length) {
        this.parsed.data.push(parts.shift());
      }
      return false;
    },
  },
});

window.onload = () => {
  app.mount("#app");
};
