function getLineAttributes() {
  const editorRegion = document.getElementById("workbench.parts.editor");
  const lineNumber = editorRegion.querySelector(".line-numbers");
  const lineNumberBox = lineNumber.getBoundingClientRect();
  const editor = editorRegion.querySelector(".lines-content");
  const editorBox = editor.getBoundingClientRect();
  const line = editor.querySelector(".view-line").firstChild;
  const lineBox = line.getBoundingClientRect();
  const editorLeft = editorBox.left;
  const lineHeight = lineNumberBox.height;
  const charWidth = lineBox.width / line.innerText.length;
  // assuming these will stay fairly constant
  return {
    editorLeft,
    charWidth,
    lineHeight,
  };
}

let editor = getLineAttributes();

function getEditorTop() {
  const editorRegion = document.getElementById("workbench.parts.editor");
  const editor = editorRegion.querySelector(".lines-content");
  const editorBox = editor.getBoundingClientRect();
  return editorBox.top;
}

function getRowCol(x, y) {
  x /= window.devicePixelRatio;
  y /= window.devicePixelRatio;
  const editorTop = getEditorTop();
  console.log(editorTop);
  const col = (x - editor.editorLeft) / editor.charWidth;
  const row = (y - editorTop) / editor.lineHeight;
  return { row: Math.floor(row + 1), col: Math.floor(col + 1) };
}
