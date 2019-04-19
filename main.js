

CANVAS_CELL_W = 20;
CANVAS_CELL_H = 20;


let tickWait = 0;
let stepsPerTick = 100;


let K = 100;
let M = 11;
let N = 11;
let contAnneal = false;
let a, sa, view;

const viewHolder = document.createElement("div");
document.body.appendChild(viewHolder);
viewHolder.update = function() {
    if (view) view.update();
};

const reset = (k, m, n) => {
    if (contAnneal) {
        stopAnneal();
    }
    K = k;
    M = m;
    N = n;
    a = new A(m, n, A.getSquareWords(K));
    a.fillRandom();
    sa = new SA(a);
    sa.setT0(K);
    sa.stopCond = function() {
        return this.prevE===0;
    };
    sa.onStop = () => {
        if (contAnneal) {
            stopAnneal();
        }
        console.log("Answer found in iteration "+sa.iteration);
        console.log(sa.el.toString());
    };
    sa.iterLimForReset = 150000;
    
    view = a.makeHTMLElem();
    viewHolder.innerHTML = "";
    viewHolder.appendChild(view);
    
    update();
};



const infoText = document.createElement("p");
infoText.classList.add("infoText");
infoText.update = () => {
    try {
        infoText.innerHTML = (
            `Grid: ${a.m}x${a.n} = ${a.m*a.n}`
            +`<br/>Squares upto: ${K}`
            +`<br/>Words amount: ${a.words.length}`
            +"<br/>Iteration: "+sa.iteration
            +"<br/>Moves: "+sa.moves
            +"<br/>T: "+sa.T
            +"<br/>P(accept inrc 1) = "+SA.getProb(1, sa.T)
            +"<br/>Energy: "+sa.prevE
        );
    } catch(e) {
        infoText.innerHTML = "No current grid";
    }
};
document.body.appendChild(infoText);



const update = function() {
    viewHolder.update();
    infoText.update();
};


const step = function(doUpdate=true) {
    sa.step();
    if (doUpdate) {
        update();
    }
};

const startAnneal = () => {
    contAnneal = true;
    startButt.innerHTML = "running...";
    startButt.disabled = true;
    onceButt.disabled = true;
    stopButt.disabled = false;
    const tick = () => {
        for (let i=0; i<stepsPerTick; i++) {
            step(i===stepsPerTick-1);
            if (!contAnneal) {
                update();
                break;
            }
        }
        if (contAnneal) setTimeout(tick, tickWait);
    }
    setTimeout(tick, 0);
};

const stopAnneal = () => {
    contAnneal = false;
    stopButt.disabled = true;
    startButt.innerHTML = "start";
    startButt.disabled = false;
    onceButt.disabled = false;
};

const onceButt = document.createElement("button");
onceButt.innerHTML = "take one step";
onceButt.onclick = ()=> {
   step();
};

const startButt = document.createElement("button");
startButt.innerHTML = "start";
startButt.onclick = ()=> {startAnneal();};

const stopButt = document.createElement("button");
stopButt.innerHTML = "stop";
stopButt.onclick = ()=>{stopAnneal();};
stopButt.disabled = true;

const controlsHolder = document.createElement("div");
controlsHolder.classList.add("controls");
controlsHolder.appendChild(onceButt);
controlsHolder.appendChild(startButt);
controlsHolder.appendChild(stopButt);
controlsHolder.appendChild(document.createElement("br"));
controlsHolder.appendChild(makeSlider("Steps per tick: ", 1, 10000, 1, stepsPerTick, val=>{
    stepsPerTick = val;
}));

document.body.appendChild(controlsHolder);

const resetHeader = document.createElement("h3");
resetHeader.innerHTML = "Reset the problem";
controlsHolder.appendChild(resetHeader);

const resetControls = document.createElement("div");
resetControls.classList.add("resetControls");
controlsHolder.appendChild(resetControls);

const kInput = makeNumberInput("K", 0, 1000, K);
const mInput = makeNumberInput("M", 1, 20, M);
const nInput = makeNumberInput("N", 1, 20, N);
resetControls.appendChild(kInput);
resetControls.appendChild(mInput);
resetControls.appendChild(nInput);


const resetButt = makeButton("set", ()=>{
    let kVal = kInput.getValue();
    let mVal = mInput.getValue();
    let nVal = nInput.getValue();
    
    if ([kVal, mVal, nVal].every(x=>Number.isInteger(x) && x>0)) {
        reset(kVal, mVal, nVal);
    } else {
        console.error("Bad reset values.");
    }
});
resetControls.appendChild(resetButt);



reset(K, 11, 11);

