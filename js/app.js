const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const computedStyle = getComputedStyle(canvas);
const height = computedStyle.height;
const width = computedStyle.width;
canvas.setAttribute('height', height);
canvas.setAttribute('width', width);