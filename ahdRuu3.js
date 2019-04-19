
class A {
    constructor(m, n, words) {
        this.m = m;
        this.n = n;
        //the words to fit
        this.words = words.map(w=>w.toString());
        //all the letters in the words concatenated, for simulating the letter distribution
        this.letters = this.words.join("");
        
        this.lines = [];
        //the symbol '_' can't be in the words
        const makeEmptyLine = (len) => new Array(len).fill('_').join(""); //join to be strings
        
        //rows
        for (let i=0; i<this.m; i++) {
            this.lines.push(makeEmptyLine(this.n));
        }
        //cols
        for (let i=0; i<this.n; i++) {
            this.lines.push(makeEmptyLine(this.m));
        }
    
        //Make the empty diags array ['_', '__', ..., '__', '_']
        const makeDiags = () => {
            const ret = [];
            for (let k=0, kEnd=this.m+this.n-1; k<kEnd; k++) {
                let len;
                if (k<this.n) {
                    len = Math.min(this.m, k+1);
                    /*
                    let ind = [0, this.n-1-k];
                    let len = 0;
                    while(ind[0]<this.m && this[1]<this.n) {
                        ind[0]++;
                        ind[1]++;
                        len++;
                    }
                    //that is: len = Math.min(this.m, k+1)
                    */
                } else {
                    const rowK = k-this.n+1;
                    len = Math.min(this.n, this.m-rowK)
                }
                this.lines.push(makeEmptyLine(len));
            }
            return ret;
        };
        //diags
        for (let _ of ["skewDiag", "diag"]) {
            for (let dl of makeDiags()) {
                this.lines.push(dl);
            }
        }
        
        //for each word (key), on how many lines it is on (value)
        this.counts = {};
        for (let w of this.words) {
            this.counts[w] = 0;
        }
        
        //for each line, a set of what words it covers
        this.coveredWords = this.lines.map(()=>new Set());
        //total number of distinct words covered
        this.covered = 0;
        //energy of the system for SA, amount of letters in the words not covered
        this.energy = this.words.reduce((cumu, w)=>cumu+(this.counts[w]?0:w.length), 0);
        
        //Table that stores what lines the index [i][j] land on.
        //They are stored as 2-element arrays
        //where index of the line is first and then then the index on that line
        this.linesOf = [];
        let skewDiagStart = this.m+this.n;
        let diagStart = skewDiagStart + this.m+this.n-1;
        for (let i=0; i<this.m; i++) {
            let row = [];
            for (let j=0; j<this.n; j++) {
                let cell = [];
                
                cell.push([i, j]); //ith row, jth place
                cell.push([this.m+j, i]); //jth col, ith place
                //skew-diag:
                let skewDiagK = i+j;
                let skewDiagPlace = skewDiagK<this.m ? j : (j-(skewDiagK-this.m+1));
                cell.push([skewDiagStart+skewDiagK, skewDiagPlace]);
                //diag:
                let diagK = (this.m-1-i)+j;
                let diagPlace = diagK<this.m ? j : (j-(diagK-this.m+1));
                cell.push([diagStart+diagK, diagPlace]);
                
                row.push(cell);
            }
            this.linesOf.push(row);
        }
        
    }
    
    
    randomLetter() {
        return this.letters[randInt(0, this.letters.length-1)];
    }
    
    
    fillRandom() {
        for (let i=0; i<this.m; i++) {
            for (let j=0; j<this.n; j++) {
                let c = this.randomLetter();
                this.setCell(i, j, c);
            }
        }
    }
    
    
    /** Set of words the line of given index covers (can read both ways) */
    getCovers(lineInd) {
        const line = this.lines[lineInd];
        const lineLen = line.length;
        const s = line+"/"+line.split("").reverse().join("");
        //return new Set(this.words.filter(w=>s.includes(w)));
        
        const ret = new Set();
        for (let w of this.words) {
            if (s.includes(w)) ret.add(w);
        }
        return ret;
    }
    
    setCell(i, j, c) {
        for (let [a, b] of this.linesOf[i][j]) {
            //array-way: this.lines[a][b] = c;
            this.lines[a] = this.lines[a].substring(0,b)+c+this.lines[a].substring(b+1);
            const coversPrev = this.coveredWords[a];
            const coversNow = this.getCovers(a);
            for (let w of coversPrev) {
                if (!coversNow.has(w)) {
                    this.counts[w]--;
                    if (this.counts[w]===0) {
                        this.covered--;
                        this.energy += w.length;
                    }
                }
            }
            for (let w of coversNow) {
                if (!coversPrev.has(w)) {
                    this.counts[w]++;
                    if (this.counts[w]===1) {
                        this.covered++;
                        this.energy -= w.length;
                    }
                }
            }
            this.coveredWords[a] = coversNow;
        }
    }
    
    
    /** Test the speed of performing a setting of random cell to random letter */
    testSpeed(testN=1e4) {
        const startT = Date.now();
        for (let testI=0; testI<testN; testI++) {
            let x = randInt(0, this.m-1);
            let y = randInt(0, this.n-1);
            let c = this.randomLetter();
            this.setCell(x, y, c);
        }
        return Date.now() - startT;
    }
    
    /** Perform a random seach by first changing cells randomly r times,
    * and then for k iterations changing one cell at a time and accepting
    * the change if it leads to better coverage.
    *
    * @returns the best found solution and its coverage as {covered, sol}
    */
    doASearch(k, r) {
        console.log("Doing a search with k = "+k+", r = "+r);
        for (let i=0; i<r; i++) {
            let x = randInt(0, this.m-1);
            let y = randInt(0, this.n-1);
            let c = this.randomLetter();
            this.setCell(x, y, c);
        }
        let sol = null;
        let bestCoverage = -1;
        let prev;
        
        let limitForCheck = 10*this.m*this.n;
        for (let i=0; i<k; i++) {
            let x = randInt(0, this.m-1);
            let y = randInt(0, this.n-1);
            let c = this.randomLetter();
            prev = this.lines[x][y];
            this.setCell(x, y, c);
            if (this.covered>=bestCoverage) {
                if (this.covered>bestCoverage) i = 0; //start the count anew when find better
                sol = this.toString();
                bestCoverage = this.covered;
                //console.log("Found new best, of coverage "+bestCoverage);
                if (bestCoverage===this.words.length) {
                    console.log("Found complete solution!");
                    break;
                }
            } else {
                this.setCell(x, y, prev);
            }
            
            //When tried for enough time without improvement
            //find out if there even is any choice for improvement
            if (i===limitForCheck) {
                const allDigs = [0,1,2,3,4,5,6,7,8,9];
                let hadImprovement = false; //improvement or equal coverage, actually
                for (let ii=0; ii<this.m; ii++) {
                    for (let jj=0; jj<this.n; jj++) {
                        for (let digit of allDigs) {
                            prev = this.lines[ii][jj];
                            this.setCell(ii, jj, c);
                            if (this.covered>=bestCoverage) {
                                if (this.covered>bestCoverage) i = 0;
                                sol = this.toString();
                                bestCoverage = this.covered;
                                //console.log("Found new best, of coverage "+bestCoverage);
                                if (bestCoverage===this.words.length) {
                                    console.log("Found complete solution!");
                                }
                                hadImprovement = true;
                                break;
                            } else {
                                this.setCell(ii, jj, prev);
                            }
                        }
                        if (hadImprovement) break;
                    }
                }
                if (!hadImprovement) {
                    break;
                }
            }
            
        }
        return {coverage: bestCoverage, sol: sol};
    }
    
    
    search(searchN, searchR, iters=1) {
        let best = null;
        for (let i=0; i<iters; i++) {
            if (best && best.sol) {
                const solGrid = best.sol.split("\n").map(r=>r.split(""));
                for (let i=0; i<this.m; i++) {
                    for (let j=0; j<this.n; j++) {
                        this.setCell(i, j, solGrid[i][j]);
                    }
                }
            }
            const found = this.doASearch(searchN, searchR);
            if (!best || found.coverage>=best.coverage) {
                best = found;
                console.log("Found new best, of coverage "+best.coverage);
                console.log(best.sol);
            }
        }
    }
    
    
    getEnergy() {
        return this.energy;
        //return this.words.length-this.covered;
    }
    
    takeRandStep() {
        const x = randInt(0, this.m-1);
        const y = randInt(0, this.n-1);
        const c = this.randomLetter();
        this.prevX = x;
        this.prevY = y;
        this.prevVal = this.lines[x][y];
        this.setCell(x, y, c);
    }
    
    cancelStep() {
        this.setCell(this.prevX, this.prevY, this.prevVal);
    }
    
    toString() {
        return this.lines.slice(0,this.m).map(x=>x/*.join("")*/).join("\n");
    }
    
    makeHTMLElem() {
        const ret = document.createElement("div");
        
        const c = document.createElement("canvas");
        c.classList.add("gridCanvas");
        ret.appendChild(c);
        
        
        const infoEl = document.createElement("p");
        infoEl.classList.add("gridInfo");
        infoEl.innerHTML = "";
        ret.appendChild(infoEl);
        
        
        ret.update = () => {
            const cellW = (CANVAS_CELL_W || 40);
            const cellH = (CANVAS_CELL_H || 40);
            c.width = cellW * this.m;
            c.height = cellW * this.n;
            const ctx = c.getContext("2d");
            ctx.font = (0.95*cellW)+"px Helvetica";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "#111";
            for (let i=0; i<this.m; i++) {
                for (let j=0; j<this.n; j++) {
                    let digit = this.lines[i][j];
                    ctx.fillText(digit, (i+0.5)*cellW, (j+0.5)*cellH, cellW);
                }
            }
            
            let wsIn = this.words.filter(w=>this.counts[w]);
            let wsNotIn = this.words.filter(w=>!this.counts[w]);
            infoEl.innerHTML = (`Words in: <span class="inWords">${wsIn.length}</span>
                <br/>Words not in: <span class="outWords">${wsNotIn.length}</span>`);
        };
        
        return ret;
    }
}


A.cleanWords = arr => {
    const ret = [];
    const hasAlready = x => {
        return ret.some( y=>y.indexOf(x)>=0 || y.indexOf(reverseString(x))>=0 );
    };
    for (let x of arr) {
        if (!hasAlready(x)) {
            ret.push(x);
        }
    }
    return ret;
};

A.getAllSubWords = (arr, minLen=1) => {
    const ret = [];
    for (let w of arr) {
        for (let i=minLen; i<=w.length; i++) {
            let subW = w.substring(0, i);
            if (ret.indexOf(subW)<0) ret.push(subW);
        }
    }
    //add words that are shorter than minLen but aren't still included in some word
    const isIn = x => ret.some(y=>y.indexOf(x)>=0 || y.indexOf(reverseString(x))>=0);
    for (let w of arr) {
        if (!isIn(w)) ret.push(w);
    }
    return ret;
}

A.getSquareWords = k => {
    let nums = new Array(k).fill(null).map((_,i)=>((i+1)**2).toString()).reverse();
    return A.cleanWords(nums);
    
    //maybe it's better to have extranous subwords,
    //they count the energy towards achieving the full words
    //return A.getAllSubWords(nums, 3);
};



