//------------ dom ------------
function h(tagName, props, children) {
    const el = document.createElement(tagName)
    return {
        el,
        tagName,
        props,
        children
    }
}

function mount(vnode, container, nextSibling) {
    if (!vnode) return

    if (vnode.props) {
        for (const prop in vnode.props) {
            if (prop === 'style') {
                const style = Object.entries(vnode.props[prop])
                    .reduce((acc, [k, v]) => {
                        const key = k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).trim()
                        acc.push(key + ':' + v)
                        return acc
                    }, []);
                vnode.props[prop] = style.join(';').toString()
            }
            if (prop.startsWith('on') && typeof vnode.props[prop] === 'function') {
                const event = prop.slice(2).toLowerCase()
                vnode.el.addEventListener(event, vnode.props[prop])
            }
            vnode.el.setAttribute(prop, vnode.props[prop])
        }
    }

    if (vnode.children || isZero(vnode.children)) {
        if (typeof vnode.children === 'string' || typeof vnode.children === 'number') {
            vnode.el.innerHTML = vnode.children
        } else if (Array.isArray(vnode.children)) {
            for (const child of vnode.children) {
                mount(child, vnode.el)
            }
        } else {
            mount(vnode.children, vnode.el)
        }
    }

    if (typeof vnode === 'string') {
        const textNode = document.createTextNode(vnode)

        if (nextSibling) {
            nextSibling.insertAdjacentElement('beforebegin', textNode)
        } else {
            container.appendChild(textNode);
        }
    } else {
        if (nextSibling) {
            nextSibling.insertAdjacentElement('beforebegin', vnode.el)
        } else {
            container.appendChild(vnode.el)
        }
    }
}

function unmount(vnode) {
    for (const prop in vnode.props) {
        if (!(prop.startsWith('on') && typeof vnode.props[prop] === 'function')) continue
        const event = prop.slice(2).toLowerCase()
        vnode.el.removeEventListener(event, vnode.props[prop])
    }

    if(!vnode.el) return
    const parent = vnode.el.parentNode
    parent.removeChild(vnode.el)
}

function diff(oldTree, newTree, container) {
    unmount(oldTree)
    mount(newTree, container)
}

//------------ reactivity ------------
const dependency = {
    observers: [],
    subscribe(effect) {
        this.observers.push(effect)
    },
    notify(state, newValue, oldValue) {
        this.observers.forEach((effect) => {
            if (!effect) return

            if(typeof effect === 'function'){
                effect()
            }

            if(typeof effect === 'object' && state === effect.state){
                effect.callback(newValue, oldValue)
            }
        });
    }
}

function reactive(states) {
    Object.keys(states).forEach(state => {
        let value = states[state]
        Object.defineProperty(states, state, {
            get() {
                return value
            },
            set(newValue) {
                const oldValue = value
                if (isEveryPrimitives(newValue,oldValue) && newValue === oldValue){
                    return
                }
                
                if(isEveryObjects(newValue, oldValue) && isEqualsObject(newValue, oldValue)){
                    return
                }
                value = newValue          
                dependency.notify(state, newValue, oldValue)
            }
        })
    })
    return states
}

function watchEffect(callback) {
    dependency.subscribe(callback)
    callback()
}

function watch(callback, state){
    const effect = dependency.observers
        .filter(effect=>typeof effect !== 'function')
        .filter(effect=> effect.state === state)
    
    if(effect.length) return
    dependency.subscribe({ state, callback })
}
//------------ core ------------
function createApp(component, container) {
    let isMounted = false
    let oldTree
    const { data } = component
    const context = Object.assign({ context: reactive(data) }, component)

    function render() {
        this.render = this.render.bind(this.context)

        if (this.methods) {
            Object.entries(this.methods).forEach(([name, method]) => {
                this.context[name] = ()=> method.call(this.context)
            })
        }

        if(this.computed){
            Object.entries(this.computed).forEach(([name, computed]) => {
                this.context[name] = computed.call(this.context)
            })
        }

        if (this.watch) {
            Object.entries(this.watch).forEach(([state, callback]) => {
                watch(callback, state)
            })
        }

        if (!isMounted) {
            oldTree = this.render(h)
            mount(oldTree, container)

            isMounted = true
            if (this.mounted) this.mounted.call(this.context)
        } else {
            const newTree = this.render(h)
            diff(oldTree,newTree,container)
            oldTree = newTree
            if (this.updated) this.updated.call(this.context)
        }
    }

    watchEffect(render.bind(context))
}

//------------ utils ------------

function isZero(value){
    return typeof value === 'number' && value === 0
}

function isPrimitive(value){
    const primitives = ['undefined','boolean','string','number']
    return value === null || primitives.includes(typeof value)
}

function isObject(value){
    return typeof value === 'object' && value !== null;
}

function isEveryPrimitives(...values){
    return values.every(value => isPrimitive(value))
}

function isEveryObjects(...values){
    return values.every(value => isObject(value))
}

function isEqualsObject(newValue, oldValue){
    return JSON.stringify(newValue) === JSON.stringify(oldValue)
}

export {
    createApp
}