export default class Draggable {
  constructor() {
    this.targetElement = null;
    this.startingX = null;
    this.startingY = null;
    this.elementX = null;
    this.elementY = null;
    document.body.addEventListener("mousemove", e => {
      if (this.targetElement) {
        let x = this.parseInt(e.pageX);
        let y = this.parseInt(e.pageY);
        let left = this.elementX + x - this.startingX;
        let top = this.elementY + y - this.startingY;
        this.targetElement.style.left = left.toString() + "px";
        this.targetElement.style.top = top.toString() + "px";
      }
    });
    document.body.addEventListener("mouseup", () => {
      if (this.targetElement) {
        this.targetElement.style.opacity = 0.95;
        this.targetElement = null;
        this.startingX = null;
        this.startingY = null;
        this.elementX = null;
        this.elementY = null;
      }
    });
  }
  add(elem, titleBar) {
    this.makeElementDraggable(elem, titleBar);
  }
  makeElementDraggable(elem, titleBar) {
    titleBar.addEventListener("mousedown", e => {
      this.targetElement = elem;
      this.targetElement.style.opacity = 0.35;
      this.startingX = this.parseInt(e.pageX);
      this.startingY = this.parseInt(e.pageY);
      this.elementX = this.parseInt(this.targetElement.style.left);
      this.elementY = this.parseInt(this.targetElement.style.top);
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
