class Draggable {
  constructor() {
    this.targetElement = null;
    this.startingX = null;
    this.startingY = null;
    this.elementX = null;
    this.elementY = null;
    document.body.addEventListener("mousemove", (e) => {
      if (this.targetElement) {
        //console.log("mousemove");
        let x = this.parseInt(e.pageX, 10);
        let y = this.parseInt(e.pageY, 10);
        let left = this.elementX + x - this.startingX;
        let top = this.elementY + y - this.startingY;
        //console.log(`left:${left}, top:${top}`);
        this.targetElement.style.left = left.toString() + "px";
        this.targetElement.style.top = top.toString() + "px";
      }
    });
    document.body.addEventListener("mouseup", (e) => {
      //console.log("mouseup");
      this.targetElement = null;
      this.startingX = null;
      this.startingY = null;
      this.elementX = null;
      this.elementY = null;
      //return false;
    });
  }
  add(elem, titleBar) {
    this.makeElementDraggable(elem, titleBar);
  }
  makeElementDraggable(elem, titleBar) {
    titleBar.addEventListener("mousedown", (e) => {
      //console.log("mousedown");
      this.targetElement = elem;
      this.startingX = this.parseInt(e.pageX, 10);
      this.startingY = this.parseInt(e.pageY, 10);
      this.elementX = this.parseInt(this.targetElement.style.left);
      this.elementY = this.parseInt(this.targetElement.style.top);
      //return false;
    });
  }
  dispose() {
    document.body.removeEventListener("mousemove", this.onmousemove);
  }

  parseInt(str) {
    let r;
    if (str === null || str === undefined || str === "") {
      r = 0;
    } else {
      r = window.parseInt(str, 10);
      if (isNaN(r)) {
        r = 0;
      }
    }
    return r;
  }
}

module.exports = Draggable;
