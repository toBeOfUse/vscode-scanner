function getLineAttributes() {
  const lineNumber = document.querySelector(".line-numbers");
  const lineNumberBox = lineNumber.getBoundingClientRect();
  const line = document.querySelector(".view-line").firstChild;
  const lineBox = line.getBoundingClientRect();
  const editor = document.querySelector(".lines-content");
  const editorBox = editor.getBoundingClientRect();
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

window.editor = getLineAttributes();

function getEditorTop() {
  const editor = document.querySelector(".lines-content");
  const editorBox = editor.getBoundingClientRect();
  return editorBox.top;
}

export default function getRowCol(x, y) {
  x /= window.devicePixelRatio;
  y /= window.devicePixelRatio;
  const col = (x - editor.editorLeft) / editor.charWidth;
  const row = (y - getEditorTop()) / editor.lineHeight;
  return { row: Math.round(row + 1), col: Math.round(col + 1) };
}
