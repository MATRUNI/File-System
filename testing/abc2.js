const { spawnSync } = require("child_process");

const editors = [
  "gedit", "xed", "kate", "pluma", "mousepad", "leafpad",
  "nano", "vim", "nvim", "emacs", "subl", "code", "atom", "geany"
];

const installedEditors = editors.filter(cmd =>
  spawnSync("which", [cmd]).status === 0
);

console.log("Installed editors:", installedEditors);
