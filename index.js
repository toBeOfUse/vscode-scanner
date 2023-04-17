class CodePosServer {
  static getEditorAttributes() {
    const editorRegion = document.getElementById("workbench.parts.editor");
    const lineNumber = editorRegion.querySelector(".line-numbers");
    const lineNumberBox = lineNumber.getBoundingClientRect();
    const editor = editorRegion.querySelector(".lines-content");
    const editorBox = editor.getBoundingClientRect();
    const line = editor.querySelector(".view-line").firstChild;
    const lineBox = line.getBoundingClientRect();
    const editorLeft = editorBox.left;
    const editorTop = editorBox.top;
    const lineHeight = lineNumberBox.height;
    const charWidth = lineBox.width / line.innerText.length;
    const openFile = editorRegion
      .querySelector(".monaco-editor")
      .getAttribute("data-uri");
    // these could be cached and only updated when a MutationObserver fires
    return {
      editorLeft,
      charWidth,
      lineHeight,
      editorTop,
      openFile,
    };
  }

  static getFileRowCol(x, y) {
    x /= window.devicePixelRatio;
    y /= window.devicePixelRatio;
    const editor = CodePosServer.getEditorAttributes();
    const col = (x - editor.editorLeft) / editor.charWidth;
    const row = (y - editor.editorTop) / editor.lineHeight;
    return {
      row: Math.floor(row + 1),
      col: Math.floor(col + 1),
      file: editor.openFile,
    };
  }

  coordsCallback(websocketEvent) {
    try {
      const coords = JSON.parse(websocketEvent.data);
      if ("x" in coords && "y" in coords) {
        const rc = CodePosServer.getFileRowCol(coords.x, coords.y);
        console.log("got", websocketEvent, "sending", rc);
        this.ws.send(JSON.stringify(rc));
      } else {
        throw "x and y not present";
      }
    } catch (e) {
      console.error("Received unusable websocket message:");
      console.error(websocketEvent);
      console.error(e);
    }
  }

  constructor() {
    this.ws = new WebSocket("ws://localhost:8888/websocket/");
    this.ws.addEventListener("message", (evt) => this.coordsCallback(evt));
    this.stop = () => this.ws.close();
  }
}
