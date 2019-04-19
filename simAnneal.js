class SA {
    constructor(el) {
        this.el = el;
        
        this.iteration = 0;
        this.moves = 0;
        
        this.prevE = this.el.getEnergy();
        this.T0 = 20;
        this.T = 1;
        this.updateT();
        
        //this.reduceFactor = 0.75;
        //this.initSteadyCounter();
        
        this.stopCond = null;
        this.onStop = null;
        this.steadyCounterGetter = null;
        this.iterLimForReset = Infinity;
    }
    
    setT0(val) {
        this.T0 = val;
        this.updateT();
    }
    
    reset() {
        this.iteration = 0;
        this.moves = 0;
        this.updateT();
    }
    
    /*
    initSteadyCounter() {
        if (typeof this.steadyCounterGetter === "function") {
            this.steadyCounter = this.steadyCounterGetter(this.T, this.iteration);
        } else {
            this.steadyCounter = 10;
        }
    }
    */
    
    updateT() {
        this.T = this.T0/(this.iteration+1)**0.5; // (Math.log(this.iteration+2)**2)??
        
        /*
        this.steadyCounter -= 1;
        if (this.steadyCounter<=0) {
            this.T *= this.reduceFactor;
            this.initSteadyCounter();
        }
        */
    }
    
    step() {
        let prevE = this.el.getEnergy();
        this.el.takeRandStep(this.T);
        this.iteration++;
        const E = this.el.getEnergy();
        const dE = E-this.prevE;
        if (randBool(SA.getProb(dE, this.T))) {
            this.moves++;
            this.prevE = E;
             this.updateT();
        } else {
            this.el.cancelStep();
        }
        
        if (typeof this.stopCond==="function" && this.stopCond()) {
            if (typeof this.onStop === "function") {
                this.onStop();
            }
        }
        
        if (this.iteration >= this.iterLimForReset) {
            this.reset();
        }
    }
    
}

/** Probability of accepting a step when its energy change is dE and the temperature is T */
SA.getProb = (dE, T) => {
    if (dE<0) return 1;
    return 1/(1+Math.exp(dE/T));
};