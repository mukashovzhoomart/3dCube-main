'use strict'


// Глобальные параметры
let rev = 1;    // к-во кругов 
let size = 1;   // исходный размер
let angle = {   // положение куба
    rotateX: -30,
    rotateY: -310,
    rotateZ: -25,
}
let timerId2D;  // id таймера для 2D/3D
let timerId3D;  // id таймера для 2D/3D


// Точный тип объекта
function type(object) {
    return Object.prototype.toString.call(object);
}

function convertRGBAtoHEX(channels) {
    const hexChannels = channels.map(entry => (`0${entry.toString(16)}`).slice(-2));

    return (`#${hexChannels.join('')}`);
}

function parseRGBA(raw) {
    const channels = raw
        .replace(/rgba|rgb|\(|\)/g, '')
        .split(/,\s*/g)
        .map((entry, index) => {
            const number = parseFloat(entry, 10);
            return (index === 3) ? Math.floor(number * 255) : number;
        });

    return channels;
}

function customSelect(model) {
    let x, i, j, l, ll, selElmnt, a, b, c;
    x = document.getElementsByClassName("custom-select");
    l = x.length;

    for (i = 0; i < l; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        ll = selElmnt.length;

        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        //a.setAttribute("data-random", Math.random()*100);


        x[i].appendChild(a);
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");

        for (j = 1; j < ll; j++) {

            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function (e) {

                let y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                sl = s.length;
                h = this.parentNode.previousSibling;

                for (i = 1; i < sl; i++) {
                    if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;

                        /* update type [START] */
                        s.setAttribute("data-select", i);
                        if (model.tools === 'tools--2d') model.type = model.allType2D[i];
                        else model.type = model.allType3D[i];
                        model.render();
                        /* update type [END] */

                        h.innerHTML = this.innerHTML;
                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        yl = y.length;
                        for (k = 0; k < yl; k++) {
                            y[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
            });
            b.appendChild(c);
        }
        x[i].appendChild(b);
        a.addEventListener("click", function (e) {
            e.stopPropagation();
            closeAllSelect(this);

            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    }

    function closeAllSelect(elmnt) {
        let x, y, i, xl, yl, arrNo = [];

        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        xl = x.length;
        yl = y.length;

        for (i = 0; i < yl; i++) {

            if (elmnt == y[i]) {
                arrNo.push(i)
            }
            else {
                y[i].classList.remove("select-arrow-active");
            }
        }

        for (i = 0; i < xl; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
            }
        }
    }

    document.addEventListener("click", closeAllSelect);
};


function toolsChange(model) {
    let modeLTools = document.querySelector(".model .checkbox");

    modeLTools.onchange = function () {
        model.switchTools();
    }
}

class Parallelogram {

    constructor() {
        this._tools = "tools--2d";
        this._type = "square__2d";

        this.render();
    }

    set tools(newTools) { this._tools = newTools; }
    get tools() { return this._tools; }

    set type(newTypeModel) { this._type = newTypeModel; }
    get type() { return this._type; }


    get allTools() {
        return ["__", "tools--2d", "tools--3d"];
    }

    get allType2D() {
        return ["__", "square__2d", "rectangle__2d", "parallelogram__2d"];
    }

    get allType3D() {
        return ["__", "square__3d", "rectangle__3d", "parallelogram__3d"];
    }


    switchTools() {
        if (this.tools === "tools--2d") {
            this.tools = "tools--3d";
            this.type = "square__3d";
        }
        else {
            this.tools = "tools--2d";
            this.type = "square__2d";
        }
        this.render();
    }

    render() {

        // update tools [START]
        let toolsHTML = document.querySelector('.tools');
        this.allTools.forEach(item => toolsHTML.classList.remove(item));
        toolsHTML.classList.add(this.tools);
        // update tools [END]


        // update type [START] 
        let formHTML = document.querySelector('.form');
        this.allType2D.forEach(item => formHTML.classList.remove(item));
        this.allType3D.forEach(item => formHTML.classList.remove(item));
        formHTML.classList.add(this.type);

        if (this.type === 'square__2d' || this.type === "square__3d") {
            formHTML.style.width = '100px';
            formHTML.style.height = '100px';
        } else {
            formHTML.style.width = '160px';
            formHTML.style.height = '90px';
        }

        let scaleButtons = {
            left:  document.querySelector('.scale .scale__decrease'),
            right: document.querySelector('.scale .scale__increase')
        };


        size = 1;

        if (this.tools === "tools--2d") {
            document.getElementById('figure').style.background = 'rgb(210, 210, 210)';
            

            scaleButtons.left.innerHTML = '-';
            scaleButtons.right.innerHTML = '+';

            scaleButtons.left.classList.remove('fas', 'fa-undo-alt', 'fSize-14');
            scaleButtons.right.classList.remove('fas', 'fa-redo-alt', 'fSize-14');

            let colorsSide = document.querySelectorAll('.colors .values li:not(:first-child) input');
            colorsSide.forEach(item => item.setAttribute('disabled', 'true'));
            
            let options3dBlocks = [document.querySelector('.figure-options .backface'),
                                   document.querySelector('.figure-options .side-labels'),
                                   document.querySelector('.figure-options .free-view')];
            let options3d = document.querySelectorAll('.figure-options .checkbox');
            options3dBlocks.forEach(item => item.style.opacity = '0.125');
            options3d.forEach(item => item.setAttribute('disabled', true));

            // 
            let form = document.querySelector('#figure .form.square__2d') ||
                document.querySelector('#figure .form.rectangle__2d');

            if (form) document.querySelector('.form').style.transform = 'scale(1)';
            else {
                form = document.querySelector('#figure .form.parallelogram__2d');
                form.style.transform = 'scale(1) skewX(-30deg)';
            }
            //
        }

        if (this.tools === "tools--3d") {
            document.getElementById('figure').style.background = 'linear-gradient(#f0f0f0, #293f50)'; 
            document.querySelector('.form').style.background = 'none'; // ***

            scaleButtons.left.innerHTML = null;
            scaleButtons.right.innerHTML = null;
            scaleButtons.left.classList.add('fas', 'fa-undo-alt', 'fSize-14');
            scaleButtons.right.classList.add('fas', 'fa-redo-alt', 'fSize-14');

            let colorsSide = document.querySelectorAll('.colors .values li:not(:first-child) input');
            colorsSide.forEach(item => item.removeAttribute('disabled'));

            let options3dBlocks = [document.querySelector('.figure-options .backface'),
                                   document.querySelector('.figure-options .side-labels'),
                                   document.querySelector('.figure-options .free-view')];
            let options3d = document.querySelectorAll('.figure-options .checkbox');
            options3dBlocks.forEach(item => item.style.opacity = '1');
            options3d.forEach(item => item.removeAttribute('disabled'));

            //
            document.querySelector('.form').style.transform = 'scale(1)';
            //
        }   

        // update type [END]

    }

}


function scale2D({type, scale}) {

    let currentWidth = document.querySelector(`.${type}`).offsetWidth;
    let currentHeight = document.querySelector(`.${type}`).offsetHeight;

    let maxWidth  = document.getElementById("figure").offsetWidth;
    let maxHeight = document.getElementById("figure").offsetHeight;
    
    // 2D square
    if (type === 'square__2d' && scale === "increase") {
        if (currentWidth < maxWidth && currentHeight < maxHeight) {
            document.querySelector('.square__2d').style.width = currentWidth + 1 + 'px';
            document.querySelector('.square__2d').style.height = currentHeight + 1 + 'px';
        }
    }

    if (type === 'square__2d' && scale === "decrease") {
        if (currentWidth > 100 && currentHeight > 100) {
            document.querySelector('.square__2d').style.width = currentWidth - 1 + 'px';
            document.querySelector('.square__2d').style.height = currentHeight - 1 + 'px';
        }
    }   

    // 2D rectangle
    if (type === 'rectangle__2d' && scale === "increase") {
        if (currentWidth < maxWidth && currentHeight < maxHeight) {
            document.querySelector('.rectangle__2d').style.width = currentWidth + 2 + 'px';
            document.querySelector('.rectangle__2d').style.height = currentHeight + 1 + 'px';
        }
    }

    if (type === 'rectangle__2d' && scale === "decrease") {
        if (currentWidth >= 160 && currentHeight >= 90) {
            document.querySelector('.rectangle__2d').style.width = currentWidth - 2 + 'px';
            document.querySelector('.rectangle__2d').style.height = currentHeight - 1  + 'px';
        }
    }

    // 2D parallelogram
    if (type === 'parallelogram__2d' && scale === "increase") {
        if ((currentWidth*0.7) < maxWidth && currentHeight < maxHeight) {
            document.querySelector('.parallelogram__2d').style.width = currentWidth + 2 + 'px';
            document.querySelector('.parallelogram__2d').style.height = currentHeight + 1 + 'px';
        }
    }

    if (type === 'parallelogram__2d' && scale === "decrease") {
        if (currentWidth >= 160 && currentHeight >= 90) {
            document.querySelector('.parallelogram__2d').style.width = currentWidth - 2 + 'px';
            document.querySelector('.parallelogram__2d').style.height = currentHeight - 1 + 'px';
        }
    }
}

function scale2DInc(model2D) {
    document.querySelector('.scale').style.display = 'none';

    timerId2D = setTimeout(function tick() {

        scale2D({ type: model2D.type, scale: "increase" });
        timerId2D = setTimeout(tick, 10);
        document.querySelector('.model .checkbox').setAttribute('disabled', 'true');

        let parallelogramWidth = document.querySelector(`.${model2D.type}`).offsetWidth;
        let parallelogramHeight = document.querySelector(`.${model2D.type}`).offsetHeight;

        let figureWidth = document.getElementById('figure').offsetWidth;
        let figureHeight = document.getElementById('figure').offsetHeight;

        if (parallelogramWidth == figureWidth || parallelogramHeight == figureHeight) {
            document.querySelector('.model .checkbox').removeAttribute('disabled');
            document.querySelector('.scale').style.display = 'flex';
            clearTimeout(timerId2D);
            return;
        }

    }, 0);
}

function scale2DDec(model) {
    document.querySelector('.scale').style.display = 'none';

    timerId2D = setTimeout(function tick() {
        scale2D({ type: model.type, scale: "decrease" });
        timerId2D = setTimeout(tick, 10);
        document.querySelector('.model .checkbox').setAttribute('disabled', 'true');

        let parallelogramWidth = document.querySelector(`.${model.type}`).offsetWidth;
        let parallelogramHeight = document.querySelector(`.${model.type}`).offsetHeight;

        if (model.type === 'parallelogram__2d' || (model.type === 'rectangle__2d')) {
            if (parallelogramWidth == 160 || parallelogramHeight == 90) {
                document.querySelector('.scale').style.display = 'flex';
                clearTimeout(timerId2D);
                return;
            }
        }

        if (model.type === 'square__2d' && parallelogramWidth == 100) {
            document.querySelector('.model .checkbox').removeAttribute('disabled');
            document.querySelector('.scale').style.display = 'flex';
            clearTimeout(timerId2D);
            return;
        }

    }, 0);
}

function getRotationAngle(target) {
    const obj = window.getComputedStyle(target, null);
    const matrix = obj.getPropertyValue('-webkit-transform') ||
        obj.getPropertyValue('-moz-transform') ||
        obj.getPropertyValue('-ms-transform') ||
        obj.getPropertyValue('-o-transform') ||
        obj.getPropertyValue('transform');

    if (matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(','),
        rotateX = 0,
        rotateY = 0,
        rotateZ = 0,
        pi = Math.PI,
        sinB = parseFloat(values[8]),
        b = Math.round(Math.asin(sinB) * 180 / pi),
        cosB = Math.cos(b * pi / 180),
        matrixVal10 = parseFloat(values[9]),
        a = Math.round(Math.asin(-matrixVal10 / cosB) * 180 / pi),
        matrixVal1 = parseFloat(values[0]),
        c = Math.round(Math.acos(matrixVal1 / cosB) * 180 / pi);

        rotateX = a || 0;
        rotateY = b || 0;
        rotateZ = c || 0;

        return {
            rotateX: rotateX,
            rotateY: rotateY,
            rotateZ: rotateZ
        };
    }
}


function skew3D(direct) {
    let rotateValue = 360 * rev;

    document.querySelector('.scale').style.display = 'none';
    timerId3D = setTimeout(function tick() {

        timerId3D = setTimeout(tick, 10);

        angle.rotateY += direct;
        rotateValue--;

        if (rotateValue <= 0) {
            document.querySelector('.scale').style.display = 'flex';
            clearTimeout(timerId3D);
            return;
        }

        let cube = document.querySelector(".square__3d .cube") ||
                   document.querySelector(".rectangle__3d .cube");

        if (!cube) {
            cube = document.querySelector(".parallelogram__3d .cube");
            cube.style.transform = `rotateX(${angle.rotateX}deg)` +
                                   `rotateY(${angle.rotateY}deg)` +
                                   `rotateZ(${angle.rotateZ}deg)` +
                                   `skewX(-30deg)`;
            return;
        }
    
        cube.style.transform = `rotateX(${angle.rotateX}deg)` +
                               `rotateY(${angle.rotateY}deg)` +
                               `rotateZ(${angle.rotateZ}deg)`;
    }, 0);
}



function scrollSizeFigure(model) {
    document.onwheel = function(e) {
       if (model.tools === 'tools--3d') {

           let figure = document.querySelector('.form');
            
                if (e.deltaY < 0) size += 0.05;
           else if (e.deltaY > 0) size -= 0.05;  

           if (size < 0.2) size = 0.2;
           if (size > 1.9) size = 1.9;

           figure.style.transform = `scale(${size})`;
       } 

    }
}


function view(model) {
    document.onkeydown = function (e) {

        if (model.tools === 'tools--3d') {
                 if (e.keyCode === 37) angle.rotateY += 5; // клавиша "Влево"        +Y
            else if (e.keyCode === 38) angle.rotateX -= 5; // клавиша "Вверх"        -Y 
            else if (e.keyCode === 39) angle.rotateY -= 5; // клавиша "Вправо"       -X
            else if (e.keyCode === 40) angle.rotateX += 5; // клавиша "Вниз"         +X
            else if (e.key === 'a')    angle.rotateZ -= 5;    //                     -Z
            else if (e.key === 'd')    angle.rotateZ += 5;    //                     +Z

            let elem = document.querySelector(".square__3d .cube") ||
                       document.querySelector(".rectangle__3d .cube");

            if (!elem) {
                elem = document.querySelector(".parallelogram__3d .cube");
                elem.style.transform = `rotateX(${angle.rotateX}deg)` +
                                       `rotateY(${angle.rotateY}deg)` +
                                       `rotateZ(${angle.rotateZ}deg)` +
                                       `skewX(-30deg)`;
                return;
            }

            elem.style.transform = `rotateX(${angle.rotateX}deg)` +
                                   `rotateY(${angle.rotateY}deg)` +
                                   `rotateZ(${angle.rotateZ}deg)`;
        } 
    }
}


function animations (model) {
    document.querySelector('.scale .scale__increase').onclick = () => {
        if (model.tools === "tools--2d") scale2DInc(model);
        if (model.tools === "tools--3d") skew3D(+1);
    }
    document.querySelector('.scale .scale__decrease').onclick = () => {
        if (model.tools === "tools--2d") scale2DDec(model);
        if (model.tools === "tools--3d") skew3D(-1);
    }
}

function showCurrentColors(model) {
    document.getElementById('getCurrentColors').onclick = function () {
        if (model.tools === 'tools--2d') {
            let toColor = document.querySelector('.colors .values .front');
            let fromColor = document.querySelector('#figure .form.square__2d') ||
                document.querySelector('#figure .form.rectangle__2d') ||
                document.querySelector('#figure .form.parallelogram__2d');
            let colorBlock = document.querySelector('.colors .values .colorBlock');


            if (window.getComputedStyle(fromColor).backgroundColor.match('rgb')) {
                toColor.value = convertRGBAtoHEX(parseRGBA(window.getComputedStyle(fromColor).backgroundColor));
            } else {
                toColor.value = window.getComputedStyle(fromColor).backgroundColor;
            }

            colorBlock.style.backgroundColor = toColor.value;
        }
        if (model.tools === 'tools--3d') {
            let toColor = document.querySelectorAll('.colors .values input');
            let fromColor = document.querySelectorAll('#figure .cube .side');
            let colorBlocks = document.querySelectorAll('.colors .values .colorBlock');

            for (let i = 0; i < toColor.length && fromColor.length; i++) {
        
                if (window.getComputedStyle(fromColor[i]).backgroundColor.match('rgb')) {
                    toColor[i].value = convertRGBAtoHEX(parseRGBA(window.getComputedStyle(fromColor[i]).backgroundColor));
                } else {
                    toColor[i].value = window.getComputedStyle(fromColor[i]).backgroundColor;
                }

                colorBlocks[i].style.backgroundColor = toColor[i].value;
            }
        }
    }
}


function decorate(model) {
    document.querySelector('.decorate').onclick = function () {
        let toColor = document.querySelectorAll('.colors .values input');
        let colorBlocks = document.querySelectorAll('.colors .values .colorBlock');
        let figureSides = document.querySelectorAll('#figure .cube .side');
        
        for (let i = 0; i < toColor.length && colorBlocks.length && figureSides.length; i++) {
            toColor[i].value = null;
            colorBlocks[i].style.background = 'none';
            figureSides[i].style.background = 'none';
        }

        let figureFront = document.querySelector('#figure .form.square__2d') ||
                        document.querySelector('#figure .form.rectangle__2d') ||
                        document.querySelector('#figure .form.parallelogram__2d');
        if (figureFront)  figureFront.style.background = 'none';
    }
}


function toggleAsideBlock() {
    let arrow = document.querySelector('.colors .arrow');
    arrow.onclick = function () {
        document.querySelector('.colors').classList.toggle('open');
    }
}


function colorPicker(model) {
    const picker = new Picker({
        parent: document.querySelector('.picker .palette'),
        popup: 'bottom' // 'right'(default), 'left', 'top', 'bottom'
    });

    let toggleColorAsideProps = {
        front: document.querySelector('.colors .front'),
        back: document.querySelector('.colors .back'),
        left: document.querySelector('.colors .left'),
        right: document.querySelector('.colors .right'),
        top: document.querySelector('.colors .top'),
        bottom: document.querySelector('.colors .bottom')
    };

    for (let item in toggleColorAsideProps) {
        toggleColorAsideProps[item].addEventListener('blur', function () {

            // если валидация прошла успешно
            if (this.value.match(/#[a-f0-9]{6,6}/gi) || this.value.match(/#[a-f0-9]{8,8}/gi)) {

                this.style.outline = null;

                if (model.tools === 'tools--2d' && item === 'front') {
                    let figureFront = document.querySelector('#figure .form.square__2d') ||
                        document.querySelector('#figure .form.rectangle__2d') ||
                        document.querySelector('#figure .form.parallelogram__2d');

                    figureFront.style.background = this.value;
                }
                else {
                    let cubeSide = document.querySelector(`.cube .${item}`);
                    cubeSide.style.background = this.value;
                }

                let cubblock = document.querySelector(`.colors .values .${item}+.colorBlock`);
                cubblock.style.background = this.value;

            }
            else { // если валидация не удачно предупредить об ошибке
                this.style.outline = null;
                if (this.value.length > 0)
                    this.style.outline = '2px solid red';
            }
        });
    }
}


function options3D() {
    let check1 = document.querySelector('.figure-options .backface .checkbox');
    let check2 = document.querySelector('.figure-options .side-labels .checkbox');
    let sides = document.querySelectorAll('.cube .side');

    check1.onchange = function () {
        if (this.checked) sides.forEach(item => item.style.backfaceVisibility = 'visible');
        else sides.forEach(item => item.style.backfaceVisibility = 'hidden');
    }
    check2.onchange = function () {
        if (this.checked) sides.forEach(item => item.style.fontSize = '32px');
        else sides.forEach(item => item.style.fontSize = '0');
    }
}


function viewOnMouse() {
    let figure = document.getElementById('figure');
    let startPos = { x: 0, y: 0 };

    figure.addEventListener('mousedown', function (e) {
        if (!document.querySelector('.free-view .checkbox').checked) return;

        startPos = {
            x: e.clientX,
            y: e.clientY
        };
        figure.addEventListener('mousemove', moveWithMouse);
    })

    figure.addEventListener('mouseup', function () {
        if (!document.querySelector('.free-view .checkbox').checked) return;
        figure.removeEventListener('mousemove', moveWithMouse);
    });

    function moveWithMouse(e) {
        let movePos = {
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y
        };

        if (Math.abs(movePos.x) > Math.abs(movePos.y)) {
            angle.rotateY -= movePos.x / 25;
        }
        if (Math.abs(movePos.y) > Math.abs(movePos.x)) {
            angle.rotateX -= movePos.y / 25;
        }


        let cube = document.querySelector(".square__3d .cube") ||
            document.querySelector(".rectangle__3d .cube");

        if (!cube) {
            cube = document.querySelector(".parallelogram__3d .cube");
            cube.style.transform = `rotateX(${angle.rotateX}deg)` +
                `rotateY(${angle.rotateY}deg)` +
                `rotateZ(${angle.rotateZ}deg)` +
                `skewX(-30deg)`;
            return;
        }

        cube.style.transform = `rotateX(${angle.rotateX}deg)` +
            `rotateY(${angle.rotateY}deg)` +
            `rotateZ(${angle.rotateZ}deg)`;
    }

}


(function main() {
    toggleAsideBlock();           // показать/скрыть боковую панель

    let model = new Parallelogram();

    customSelect(model);     // выборка формы параллелограма 
    toolsChange(model);      // инструменты: выборка пространства и вид анимации

    scrollSizeFigure(model); // приближение оли отдаление 3D фигуркы
    view(model);             // свободный обзор 3D фигурки
    animations(model)        // анимации для 2D и 3D фигурки

    colorPicker(model);       // плагин color-picker
    showCurrentColors(model); // показать в боковем панеле текущие цвета
    decorate(model);          // удалить окраску фигуры
    
    options3D();             // опции 3D: [показать надписи сторон, невидимую часть фигуры]
    viewOnMouse();          // // свободный обзор 3D фигурки с помощью мыши

})()