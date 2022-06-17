// Exports convenience functions to global variables for REPL testing.
( function(){
    
    const pink = Symbol('pink')
    const blue = Symbol('blue')
    const flicker = Symbol('flicker')
    const dim = Symbol('dim')
    const PANIC = Symbol('PANIC')

    let colorPlain = `color: rgb(200, 200, 200)`
    let colorDim = `color: rgb(100, 100, 150)`
    let colorPink = `color: rgb(255, 160, 230); text-shadow: `
                        +`0.1em 0.1em 0.5em rgba(255, 160, 230, 0.99), `
                        +`0.0em 0.0em 0.25em rgba(255, 160, 230, 0.99)`
    let colorBlue = `color: rgb(120, 135, 255); text-shadow: `
                        +`0.1em 0.1em 0.65em rgba(120, 135, 255, 0.99), `
                        +`0.0em 0.0em 0.25em rgba(120, 135, 255, 0.99)`
    let colorPanic = `color: rgb(255, 240, 85); text-shadow: `
                        +`0.1em 0.1em 0.15em rgba(255, 85, 115, 0.99), `
                        +`0.1em -0.1em 0.25em rgba(255, 85, 115, 0.99), `
                        +`0.1em +0.1em 0.25em rgba(255, 85, 115, 0.99),`
                        +`0.0em +0.0em 0.5em rgba(255, 85, 115, 0.99)`
    let barnyard = '💀👻👽👾🤖😻🙉🐶🦒🦊🦝🐷🐭🐹🐰🐨🐼🐸🦄🐔🐲🐐🐘🦎🐢🐊🐍🐬🐳🐟🐠🦐🦑🐙🦞🦀🦆🐓🦃🦅🕊🦜🦩🦚🐦🐧🐤🦇🦋🐌🐛🦗🦠'

    function upTo(n){
        n++
        return new Array(n).keys()
    }

    function barn(n){
            if(n){
                if(n > barnyard.length / 2 - 1)
                    return '❌'

                n *= 2;
            }
        n ??= 2 * rnd(0,(barnyard.length / 2 - 1))
        return String.fromCodePoint( barnyard.codePointAt(n) )
    }

    // Do something, but later.
    function later(f, ...etc){
        return new Promise(y=>
            setTimeout(()=>{y(f(...etc))}, rnd(1500,3500))
        )
    }

    // Usage: qlog(x); qlog(y); qlog.send();
    function qlog(...etc){
        qlog.queue ??= []
        qlog.queue.push(...etc)
    }

    qlog.unprint = () => qlog.queue.pop()
    qlog.send = () => {log(...qlog.queue); qlog.queue.length = 0;}

    // Usage example: log('abc', 'def', pink, 'xyz', blue)
    function log(...etc){

        if(etc.length <= 1)
            return console.log(...etc) ?? etc[0]

        let str = ''
        let unformatted = ''
        let colors = []
        let resetColor = colorPlain

        if(etc[0] === PANIC){ // Switch color behavior for error strings
            resetColor = colorPanic
            etc.shift()
        }

        let mode = resetColor

        while(etc.length){
            let current = etc.pop()

            switch(current){
                // When encountering a text-mode symbol, switch into that state.
                case pink:
                    mode = colorPink
                    break

                case blue:
                    mode = colorBlue
                    break

                case flicker:
                    mode = flickerCss()
                    break

                case dim:
                    mode = colorDim
                    break
                
                case PANIC:
                    mode = colorPanic
                    break
                    
                // If encountering something other than a special state symbol...
                default:
                    if(typeof current !== 'object'
                        && typeof current !== 'function'
                    ){
                        colors.unshift(mode)
                        str = '%c' + current + str
                        unformatted = current + unformatted
                    }
                    else{   // Objects get unshifted onto the argument list.
                        colors.unshift(current)
                        str = '%o ' + str
                        unformatted = '<object>' + unformatted
                    }

                    mode = resetColor   // Next time, revert to default unless otherwise specified.
            }
        }

        console.log(str, ...colors)
        return unformatted

        function flickerCss(){
            log.flickerCss ??= {}
            log.flickerCss.switch ??= true
            log.flickerCss.lastH ??= 0
            log.flickerCss.hueDirection ??= true

            log.flickerCss.switch = !log.flickerCss.switch
            
            if(log.flickerCss.hueDirection){
                log.flickerCss.lastH += rnd(1,10)
                    if(log.flickerCss.lastH >= 30)
                        log.flickerCss.hueDirection = false
            }
            else{
                log.flickerCss.lastH -= rnd(1,10)
                    if(log.flickerCss.lastH <= 0)
                        log.flickerCss.hueDirection = true
            }

            let l;
                if(log.flickerCss.switch)
                    l = rnd(70,80)
                else
                    l = rnd(45,60)

            return `color: hsl(`+log.flickerCss.lastH+`, 100%, `+l+`%)`
        }
    }

    const MultiArray = class{
        constructor(...dimensions){
        this.dimensions = dimensions
        this.marr = fill('',...dimensions)
        
        function fill(k='', ...etc){
            const n = etc[0]
            let a = new Array(n)
            
            if(etc.length === 1){    
                for(let i = 0; i < n; i++)a[i]= k+i
                return a
            }

            //else
            for(let i = 0; i < n; i++)
                a[i] = fill(k+i,...etc.slice(1))
            
            return a
        }
        }

        assign(value, ...ijk){

            if(ijk.length !== this.dimensions.length)
                return err('Dimensions do not match.')

            for(let n = 0; n < ijk.length; n++)
                if(ijk[n] >= this.dimensions[n])
                    return err('Index out of bounds.')

            let ptr = this.marr
            do{
                ptr = ptr[ijk.shift()]
            } while (ijk.length > 1)
                
            ptr[ijk.shift()] = value;
        }

        map(callback){
            let result = new MultiArray(...this.dimensions)
            let indices = new Array(this.dimensions.length).fill(0)

            const step = (index = this.dimensions.length - 1) => {
                if(index < 0)
                    return false
                
                indices[index]++
                if(indices[index] >= this.dimensions[index]){
                    indices[index] = 0
                    return step(index - 1)
                }
                return true
            }

            do{
                result.assign(callback(this.fetch(...indices)), ...indices)
            } while(step())

            return result
        }

        [Symbol.iterator](){
            let that = this
            let done = false

            return {indices:new Array(this.dimensions.length).fill(0), next(){
                // internal method for incrementing the counter
                const tick = (index = that.dimensions.length - 1) => {
                    if(index < 0)
                        return false

                    this.indices[index]++
                    if(this.indices[index] >= that.dimensions[index]){
                        this.indices[index] = 0
                        return tick(index - 1)
                    }
                    return true
                }

                if(done)
                    return {done:true}

                let rv = that.fetch(...this.indices)
                if( !tick() ){
                    done = true
                }
                
                return {value: rv, done: false}
            }}
        }

        fetch(...ijk){
            if(ijk.length > this.dimensions.length) return err('Too many parameters.')
            for(let i = 0; i < ijk.length; i++)//bounds checking
                if(ijk[i] >= this.dimensions[i]) return err('Out of bounds.')
            let index, ptr = this.marr;
            while( (index = ijk.shift()) !== undefined )ptr=ptr[index]
            return ptr
        }
        
        print(){
            for(let io = 0; io < this.dimensions[0]; io++){
                qlog('(',dim)
                parse(this.marr[io], ...this.dimensions.slice(1) )
                qlog(')',dim)
                qlog.send()
            }

            return this

            function parse(ptr, ...dims){
                let str = '';
                if(dims.length === 1){	// generally, write terminal condition first?
                    qlog('<',dim)
                    for(let i = 0; i < ptr.length; i++)
                        qlog(ptr[i] + (i !== ptr.length - 1 ? ' ' : ''), flicker)
                    qlog('>',dim, ' ')
                    return;
                }
                
                // Otherwise, if not at terminal condition...
                qlog('[',dim)
                for(let ix = 0; ix < dims[0]; ix++)
                {
                    parse(ptr[ix], ...dims.slice(1))
                }
                qlog(']',dim)
            }
        }
        }

    function rnd(min = 0, max = 10){
        return(Math.floor( Math.random() * (1 + max - min) + min ))
    }

    function allKeys(child){
        if( !child )
            return [];

        let rv = Reflect.ownKeys(child);
        let parent = Object.getPrototypeOf(child);
        if(parent){
            rv.push( ...allKeys(Object.getPrototypeOf(child)).map(s => `«${parent.constructor.name}» ` + String(s) ));
        }

        return rv;
    }

    // Export global variables
    globalThis.pink     = pink
    globalThis.blue     = blue
    globalThis.flicker  = flicker
    globalThis.dim      = dim
    globalThis.PANIC    = PANIC
    globalThis.log      = log
    globalThis.qlog     = qlog
    globalThis.rnd      = rnd
    globalThis.later    = later
    globalThis.MultiArray = MultiArray
    globalThis.barnyard = barnyard
    globalThis.moo      = barn
    globalThis.upTo     = upTo
    globalThis.allKeys     = allKeys
    globalThis.err      = (...etc) => {log(PANIC, ...etc)}

    log('Convience functions imported.', blue)
})()