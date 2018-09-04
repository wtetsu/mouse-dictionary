const dom = {};

dom.create = html => {
  var template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

export default dom;
