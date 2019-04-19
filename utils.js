const SQRT_2 = Math.sqrt(2);

const randInt = (a, b)=>a+Math.floor(Math.random()*(b-a+1));
const randIntW = (a, b, w)=>a+Math.floor(Math.random()**w*(b-a+1));
const randBool = (prob)=>Math.random()<prob;

const getMostFrequent = arr => {
    const counts = {};
    let maxF = 0;
    let maxEl = undefined;
    for (let x of arr) {
        if (!counts[x]) counts[x] = 0;
        counts[x] += 1;
        if (counts[x]>maxF) {
            maxF = counts[x];
            maxEl = x;
        }
    }
    return {el: maxEl, count: counts[maxEl]};
};

const reverseString = s => s.split("").reverse().join("");


/* Max amount a can be slided into b
* They are placed as a+b.
*/
const getMaxAgree = (a, b) => {
    let k = Math.min(a.length, b.length);
    while (k) {
        if (a.substring(a.length-k)===b.substring(0, k)) break;
        k--;
    }
    return k;
};


const getMaxAgreeAllowRev = (a,b) => {
    return Math.max(
        getMaxAgree(a, b),
        getMaxAgree(b, a),
        getMaxAgree(reverseString(a), b),
        getMaxAgree(b, reverseString(a))
    );
};


const getPermus = arr => {
    let ret = [];
    for (let i=0; i<arr.length; i++) {
        let rest = getPermus(arr.slice(0, i).concat(arr.slice(i + 1)));
        if(!rest.length) {
            ret.push([arr[i]]);
        } else {
            for(let j=0; j<rest.length; j++) {
                ret.push([arr[i]].concat(rest[j]));
            }
        }
    }
    return ret;
};

/** Get the adjacancy representation of a cycle (of numbers [0..n]) given as a tour */
const makeAdj = permu => {
    const n = permu.length;
    const ret = [];
    for (let i=0; i<n; i++) {
        ret.push(permu[(permu.indexOf(i)+1)%n]);
    }
    return ret;
};

/** Get the ordinal representation of a cycle (of numbers [0..n]) given as a tour */
const makeOrd = permu => {
    const n = permu.length;
    const inds = new Array(n).fill(null).map((_,i)=>i);
    const ret = [];
    for (let i=0; i<n; i++) {
        let ind = inds.indexOf(permu[i]);
        inds.splice(ind, 1);
        ret.push(ind);
    }
    return ret;
};




const erfInv = x => {
    let z;
    let a  = 0.147;                                                   
    let the_sign_of_x;
    if(0===x) {
        the_sign_of_x = 0;
    } else if(x>0){
        the_sign_of_x = 1;
    } else {
        the_sign_of_x = -1;
    }

    if(0!==x) {
        let ln_1minus_x_sqrd = Math.log(1-x*x);
        let ln_1minusxx_by_a = ln_1minus_x_sqrd / a;
        let ln_1minusxx_by_2 = ln_1minus_x_sqrd / 2;
        let ln_etc_by2_plus2 = ln_1minusxx_by_2 + (2/(Math.PI * a));
        let first_sqrt = Math.sqrt((ln_etc_by2_plus2*ln_etc_by2_plus2)-ln_1minusxx_by_a);
        let second_sqrt = Math.sqrt(first_sqrt - ln_etc_by2_plus2);
        z = second_sqrt * the_sign_of_x;
    } else { // x is zero
        z = 0;
    }
  return z;
}

const randGaussian = () => {
    const u = 2*Math.random() - 1;
    return SQRT_2 * erfInv(u);
};



const makeSlider = function(name, minVal, maxVal, step, startVal, callback) {
    const slider = document.createElement("input");
    const lab = document.createElement("label");
    lab.innerHTML = name;
    lab.appendChild(slider);
    const valText = document.createElement("span");
    valText.innerHTML = startVal;
    lab.appendChild(valText);
    slider.setAttribute("type", "range");
    slider.setAttribute("min", minVal);
    slider.setAttribute("max", maxVal);
    slider.setAttribute("step", step);
    slider.setAttribute("value", startVal);
    slider.oninput = _=> {
        const val = parseFloat(slider.value);
        valText.innerHTML = val;
        if (typeof callback === "function") {
            callback(val);
        };
    };
    lab.getValue = _=> parseFloat(slider.value);
    lab.setValue = val=>{slider.value = val; valText.innerHTML = val};
    return lab;
};


const makeNumberInput = function(name, min, max, val) {
    const lab = document.createElement("label");
    const input = document.createElement("input");
    input.type = "number";
    input.min = min;
    input.max = max;
    input.value = val;
    lab.getValue = () => parseFloat(input.value);
    lab.innerHTML = name+": ";
    lab.appendChild(input);
    return lab;
};

const makeButton = function(name, callback) {
    var b = document.createElement("button");
    b.innerHTML = name;
    b.onclick = _=> {
        if (typeof callback === "function") {
            callback();
        }
    };
    return b;
};
