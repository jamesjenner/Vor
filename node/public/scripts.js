var div = document.createElement('div');
text = document.createTextNode('This box was added by scripts.js');

div.className = "colorBox blueBox";
div.appendChild(text);
document.getElementsByTagName('body')[0].appendChild(div);