import dom from "./dom";

export default class Draggable {
  constructor(normalStyles, movingStyles) {
    this.normalStyles = normalStyles;
    this.movingStyles = movingStyles;
    this.targetElement = null;
    this.startingX = null;
    this.startingY = null;
    this.elementX = null;
    this.elementY = null;
    this.onmouseup = null;
    this.lastLeft = null;
    this.lastTop = null;
    document.body.addEventListener("mousemove", e => {
      if (this.targetElement) {
        let x = this.parseInt(e.pageX);
        let y = this.parseInt(e.pageY);
        this.lastLeft = this.elementX + x - this.startingX;
        this.lastTop = this.elementY + y - this.startingY;
        this.targetElement.style.left = this.lastLeft.toString() + "px";
        this.targetElement.style.top = this.lastTop.toString() + "px";
      }
    });
    document.body.addEventListener("mouseup", () => {
      if (this.targetElement) {
        dom.applyStyles(this.targetElement, this.normalStyles);
        this.targetElement = null;
        this.startingX = null;
        this.startingY = null;
        this.elementX = null;
        this.elementY = null;
        if (this.onmouseup) {
          this.onmouseup({ left: this.lastLeft, top: this.lastTop });
        }
      }
    });
  }
  add(elem, titleBar) {
    this.makeElementDraggable(elem, titleBar);
    setInterval(() => {
      const width = elem.clientWidth;
      const height = elem.clientHeight;
      console.warn({ width, height });
    }, 3000);
  }
  makeElementDraggable(elem, titleBar) {
    titleBar.addEventListener("mousedown", e => {
      this.targetElement = elem;
      dom.applyStyles(this.targetElement, this.movingStyles);
      this.startingX = this.parseInt(e.pageX);
      this.startingY = this.parseInt(e.pageY);
      this.elementX = this.parseInt(this.targetElement.style.left);
      this.elementY = this.parseInt(this.targetElement.style.top);
      this.lastLeft = null;
      this.lastTop = null;
    });
  }

  parseInt(str) {
    let r;
    if (str === null || str === undefined || str === "") {
      r = 0;
    } else {
      r = parseInt(str, 10);
      if (isNaN(r)) {
        r = 0;
      }
    }
    return r;
  }
}
