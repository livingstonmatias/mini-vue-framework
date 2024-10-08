# Mini framework frontend javascript &#x1F680;

Bienvenidos a este tutorial donde aprenderemos a crear un framework JavaScript muy sencillo, inspirado en Vue.js. A lo largo de este tutorial, analizaremos el codigo de un pequeño framework frontend, que nos ayudará a entender un poco cómo funcionan estos bajo el capo.

Vue.js es conocido por su simplicidad para crear interfaces de usuario dinámicas. A medida que avancemos, desglosaremos cómo funciona Vue.js internamente y replicaremos algunas de sus características clave, como la creación de un Virtual DOM, el manejo de datos reactivos y la capacidad de renderizar componentes.

## ¿Qué aprenderás?

- [**Creación de un Virtual DOM**](#Creación-de-un-Virtual-DOM): Descubrirás cómo utilizar la funcion `h` (hyperscript) para crear nodos virtuales que luego se renderizarán en el DOM real.Además, aprenderás a desarrollar métodos para insertar y eliminar  estos nodos del DOM, específicamente las funciones `mount` ,`unmount` y `diff` para comparar los nodos.
- [**Mecanismo para la Reactividad**](#Mecanismo-para-la-Reactividad): Implementaremos un sistema básico de reactividad para que los datos cambien automáticamente en la interfaz cuando se actualicen. Utilizaremos el patrón observador para construir este sistema de reactividad y las funciones `reactive`, `watchEffect` y `watch`.
- [**Renderizando nuestro componente**](#Renderizando-nuestro-componente): Veremos cómo construir un componente básico que se renderiza dinámicamente en función del estado de los datos. La funcion `createApp` se encargará de inicializar el componente y configurar su estado y comportamiento.

Al final de este tutorial, tendrás una mejor idea de cómo funciona el DOM, cómo manipularlo con JavaScript y cómo los frameworks como Vue.js logran su magia.

# Creación de un Virtual DOM
### Introducción a los Nodos Virtuales y la Manipulación del DOM

Cuando hablamos de la creación de interfaces dinámicas en la web, el DOM (Document Object Model) es una pieza fundamental. El DOM es una representación en forma de árbol de la estructura de un documento HTML. Manipular este árbol es esencial para crear aplicaciones interactivas y dinámicas. Sin embargo, la manipulación directa del DOM puede ser costosa en términos de rendimiento, especialmente cuando se realizan múltiples actualizaciones a la vez.

### ¿Por qué es Costoso Manipular el DOM?

El DOM fue diseñado en un tiempo en que las páginas web eran principalmente documentos estáticos. Cada vez que manipulamos el DOM, como añadir o eliminar un nodo, el navegador tiene que recalcular los estilos, redibujar la pantalla y posiblemente reorganizar toda la estructura del árbol DOM. Estas operaciones son lentas porque el navegador necesita asegurarse de que la página se renderice correctamente después de cada cambio.

### La Solución: Nodos Virtuales (Virtual DOM)

Aquí es donde entran en juego los nodos virtuales, o **Virtual DOM**. En lugar de manipular el DOM directamente, frameworks como React y Vue.js introducen el concepto de un "DOM virtual". Un Virtual DOM es una representación ligera de la estructura del DOM en memoria. Se usa para calcular los cambios necesarios sin tocar el DOM real, lo que permite minimizar las operaciones costosas.

## Paso 1: Implementar funcion `h` para crear Nodos Virtuales

Para entender mejor cómo funciona, vamos implementar una versión simplificada de un nodo virtual con JavaScript. La funcion `h` sera la encargada de crear los nodos virtuales:

```javascript
function h(tagName, props, children) {
    const el = document.createElement(tagName)
    return {
        el,
        tagName,
        props,
        children
    }
}
```
### Explicación de la Función `h`

La función `h` se utiliza para crear un nodo virtual en un Virtual DOM. Esta función recibe tres argumentos y retorna un objeto que representa un nodo virtual. Aquí están los detalles:

#### Argumentos

1. **`tagName`**:
   - **Tipo:** `string`
   - **Descripción:** El nombre del elemento HTML que se debe crear. Por ejemplo, `'div'`, `'span'`, `'p'`, etc. Este es el tipo de etiqueta HTML que se usará en el Virtual DOM.

2. **`props`**:
   - **Tipo:** `object`
   - **Descripción:** Un objeto que contiene las propiedades del elemento. Estas propiedades pueden incluir atributos HTML, clases CSS, identificadores, y otros atributos del elemento.

3. **`children`**:
   - **Tipo:** `string` | `vnode` | `Array<string | vnode>` | `undefined`
   - **Descripción:** Los hijos del elemento pueden ser:
     - Un texto plano (string).
     - Un nodo virtual (vnode).
     - Un array de textos planos o nodos virtuales.
     - `undefined` si el elemento no tiene hijos.

#### Retorno

La función `h` retorna un objeto que representa un nodo virtual. Este objeto tiene la siguiente estructura:

- **`el`**:
  - **Tipo:** `HTMLElement`
  - **Descripción:** Un elemento HTML creado con `document.createElement(tag)`. Aunque en el contexto de un Virtual DOM no se utiliza directamente para manipulación, este campo puede ser útil para referencia o depuración.

- **`tagName`**:
  - **Tipo:** `string`
  - **Descripción:** El nombre del elemento HTML que fue pasado como argumento. Este valor se usa para identificar el tipo de elemento en el Virtual DOM.

- **`props`**:
  - **Tipo:** `object`
  - **Descripción:** El objeto de propiedades que contiene los atributos y características del elemento. Este objeto puede ser utilizado para configurar el elemento cuando se renderiza en el DOM real.

- **`children`**:
  - **Tipo:** `Array` o `undefined`
  - **Descripción:** Un array que contiene los nodos hijos del elemento. Estos nodos hijos pueden ser otros nodos virtuales o texto, y se renderizarán como parte del contenido del elemento en el DOM real.

#### Ejemplo de uso de la function `h`:

```javascript
const element = h('h1', {}, 'Hello World!')
```
Ahora esta guandando un nodo virtual en memoria, en este caso en la variable `element`. Pero aun no es sufisiente necesitamos una funcion que se encargue de representar estos nodos virtuales en el DOM y es ahi donde aparece `mount`.

## Paso 2: Implementación de la Función `mount`

Con la función `h` lista para crear nodos virtuales, el siguiente paso es implementar la función `mount` para convertir esos nodos virtuales en elementos HTML reales y insertarlos en el DOM. La función `mount` se encarga de preparar los nodos virtuales y de insertarlos en el DOM de manera ordenada utilizando el argumento `nextSibling` para un control preciso de la inserción.

```javascript
function mount(vnode, container, nextSibling) {
    if (!vnode) return
    // manejo de props del vnode.
    if (vnode.props) {
        for (const prop in vnode.props) {
            // si la prop es un style.
            if (prop === 'style') {
                const style = Object.entries(vnode.props[prop])
                    .reduce((acc, [k, v]) => {
                        // reduce el objeto a un array de string "k:v".
                        const key = k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).trim()
                        acc.push(key + ':' + v)
                        return acc
                    }, [])
                // concatena los elementos del array con ";" y convierte a string.
                vnode.props[prop] = style.join(';').toString()
            }
            // si la prop es un listener.
            if (prop.startsWith('on') && typeof vnode.props[prop] === 'function') {
                const event = prop.slice(2).toLowerCase()
                vnode.el.addEventListener(event, vnode.props[prop])
            }
            //se agregan los atributos al elemento que se insertara en el DOM.
            vnode.el.setAttribute(prop, vnode.props[prop])
        }
    }
    // manejo de children del vnode.
    if (vnode.children || isZero(vnode.children)) {
        if (typeof vnode.children === 'string' || typeof vnode.children === 'number') {
            // si children en un primitivo string o number.
            vnode.el.innerHTML = vnode.children;
        } 
        else if (Array.isArray(vnode.children)) {
            // si children es una lista de vnodes.
            for (const child of vnode.children) {
                mount(child, vnode.el)
            }
        } 
        else {
            // si children es un vnode.
            mount(vnode.children, vnode.el)
        }
    }
    // manejo de insercion en el DOM.
    if (typeof vnode === 'string') {
        const textNode = document.createTextNode(vnode)
        // nextSibling en los dos casos es opcional y se usa para el renderizado 
        // condicional para tener una referencia al volver a insertar un vnode al dom.
        if (nextSibling) {
            nextSibling.insertAdjacentElement('beforebegin', textNode)
        } else {
            container.appendChild(textNode)
        }
    } else {
        if (nextSibling) {
            nextSibling.insertAdjacentElement('beforebegin', vnode.el)
        } else {
            container.appendChild(vnode.el)
        }
    }
}
```

### Explicacion de la Función `mount`

La función `mount` realiza las siguientes tareas:

1. **Verificar Nodo Virtual:**
   - La función primero verifica si el nodo virtual (`vnode`) existe. Si no existe, simplemente retorna.

2. **Crear el Elemento HTML:**
   - Si el nodo virtual tiene propiedades (`props`), la función aplica estas propiedades al elemento HTML:
     - **Estilos:** Las propiedades de estilo se convierten a una cadena CSS válida.
     - **Eventos:** Los eventos se añaden como listeners al elemento HTML.
     - **Otros Atributos:** Los demás atributos se configuran directamente en el elemento.

3. **Agregar Hijos:**
   - La función maneja los hijos del nodo virtual:
     - **Texto o Número:** Si el hijo es un texto o número, se asigna como `innerHTML` del elemento.
     - **Array de Hijos:** Si los hijos son un array, la función llama recursivamente a `mount` para cada hijo.
     - **Nodo Único:** Si el hijo es un único nodo virtual, se monta de manera similar.

4. **Insertar en el DOM:**
   - Finalmente, el elemento HTML o el nodo de texto se inserta en el DOM:
     - **Texto:** Si el nodo es una cadena de texto, se crea un `TextNode` y se inserta antes del `nextSibling` si está presente, o al final del contenedor.
     - **Elemento HTML:** Si el nodo es un elemento HTML, se inserta de manera similar usando `insertAdjacentElement` si `nextSibling` está presente, o al final del contenedor.

#### Ejemplo de uso de la funcion `mount`:

```javascript
const container = document.getElementById('root')
const element = h('h1', {}, 'Hello World!')
mount(element, container)
```

## Paso 3: Implementación de la Función `unmount`

La función `unmount` se encarga de eliminar un nodo virtual (vnode) del DOM. Esta función es útil cuando necesitas deshacerte de un elemento HTML y limpiar cualquier recurso asociado, como los event listeners.

```javascript
function unmount(vnode) {
    // eliminar listeners.
    for (const prop in vnode.props) {
        if (!(prop.startsWith('on') && typeof vnode.props[prop] === 'function')) continue
        const event = prop.slice(2).toLowerCase()
        vnode.el.removeEventListener(event, vnode.props[prop])
    }

    // eliminar el elemento del DOM.
    if (!vnode.el) return
    const parent = vnode.el.parentNode
    parent.removeChild(vnode.el)
}
```
### Explicacion de la Función `unmount`

La función `unmount` realiza las siguientes tareas:

1. **Eliminar Event Listeners:**
   - La función recorre las propiedades del nodo virtual (`vnode.props`) para identificar y eliminar los event listeners que se habían agregado previamente.
     - **Evento de Eliminación:** Si una propiedad es un evento (es decir, empieza con `on`) y es una función, se elimina el event listener correspondiente del elemento HTML (`vnode.el`).
     - **Conversión de Evento:** El nombre del evento se convierte a minúsculas, eliminando el prefijo `on`, y se utiliza para remover el listener.

2. **Eliminar el Elemento del DOM:**
   - La función verifica si el elemento HTML (`vnode.el`) existe. Si es así:
     - **Obtener el Nodo Padre:** Se obtiene el nodo padre del elemento HTML.
     - **Eliminar el Elemento:** Se elimina el elemento HTML del DOM usando `removeChild` en el nodo padre.

#### Ejemplo de uso de funcion `unmount`:

```javascript
const container = document.getElementById('root')
const element = h('h1', {}, 'Hello World!')
mount(element, container)
setTimeout(()=>{
  unmount(element)
},2000)
```

## Paso 4: Implementación de la Función `diff`

En resumen, la función `diff` se encarga de gestionar las actualizaciones del DOM de manera eficiente al comparar el estado antiguo con el nuevo y aplicar solo los cambios necesarios. Esto permite que la interfaz de usuario se mantenga en sincronía con el estado de la aplicación sin realizar actualizaciones innecesarias.

```javascript
function diff(oldTree, newTree, container) {
    // desmonta el arbol antiguo del DOM.
    unmount(oldTree)
    // monta el nuevo arbol en el DOM.
    mount(newTree, container)
}
```
### <span style="font-size:32px"> &#x1F9A5;</span> Soy algo peresozo y no tengo una implementacion para la funcion `diff`. Pero para fines didacticos, esta solucion es aceptable.

#### Ejemplo uso de la funcion `diff`:
```javascript
const container = document.getElementById('root')
const oldElement = h('h1',{ id:'old' }, 'Hello World!')
const newElement = h('h1',{ id:'new' }, 'Hello World!')

mount(oldElement, container)

setTimeout(()=>{
  diff(oldElement, newElement, container)
},5000)
```

# Mecanismo para la Reactividad

En JavaScript, la reactividad es un principio que permite que las interfaces de usuario se actualicen de manera automática cuando los datos cambian. Esto es crucial en el desarrollo de aplicaciones modernas, donde la UI debe reflejar constantemente el estado actual de la aplicación sin necesidad de manipular manualmente el DOM.

En lugar de que los desarrolladores tengan que actualizar la interfaz cada vez que algo cambia, los frameworks reactivos como React, Vue.js, se encargan de esta tarea. Estos frameworks siguen un enfoque declarativo, donde defines cómo debería lucir la UI en función del estado. Luego, cuando el estado cambia, el framework se asegura de que la UI se actualice automáticamente.

## Paso 1: El Objeto dependency
El objeto dependency es una implementación del patrón de diseño conocido como patrón observador. Este patrón permite que ciertos objetos (observadores) se registren para recibir notificaciones de cambios en otros objetos (sujetos o estados). En nuestro caso, dependency se encarga de gestionar estas notificaciones cuando los datos cambian.

```javascript
const dependency = {
    // una array donde se van guardando las funciones o objetos.
    observers: [],

    // suscribe una funcion o un objeto a la lista de observadores.
    subscribe(effect) {
        this.observers.push(effect)
    },
    // recorre la lista de observadores y ejecuta un callback si hay un cambio de estado.
    notify(state, newValue, oldValue) {
        this.observers.forEach((effect) => {
            if (!effect) return

            // si el observador es una funcion.
            if (typeof effect === 'function') {
                effect();
            }

            // si el observador es un objeto ejecuta su metodo "callback".
            // pasa por argumento el nuevo y antiguo valor.
            if (typeof effect === 'object' && state === effect.state) {
                effect.callback(newValue, oldValue)
            }
        })
    }
}
```
### observers `Array<Function | Object`
Es un array que almacena todos los efectos que están interesados en los cambios de estado. Estos efectos pueden ser simplemente funciones o objetos.

### subscribe 
Este funcion añade un efecto a la lista de observadores. Cuando se produce un cambio en el estado, todos los efectos en esta lista serán notificados.

#### Argumentos

1. **`effect`**:
   - **Tipo:** `Function` | `Object`
   - **Descripción:** `effect` puede ser una funcion o un objeto que cuente con un metodo "callback".

### notify 
Cuando el estado cambia, este método recorre la lista de observadores y les informa sobre el cambio de estado:
- Si el efecto es una función, simplemente la ejecuta.
- Si el efecto es un objeto, verifica si el estado coincide con el estado observado y llama al metodo "callback" del objeto pasando como argumento el nuevo y antiguo valor.

#### Argumentos

1. **`state`**:
   - **Tipo:** `string`
   - **Descripción:** `state` es el nombre del estado del cual queremos notificar.

2. **`newValue`**:
   - **Tipo:** `string`
   - **Descripción:** `newValue` es el nuevo valor del estado.

3. **`oldValue`**:
   - **Tipo:** `string`
   - **Descripción:** `oldValue` es el antiguo valor del estado.

## Paso 2: La funcion reactive
El objeto reactive convierte un objeto ordinario en un objeto reactivo, lo que significa que el objeto ahora puede reaccionar a cambios en sus propiedades y notificar a los observadores correspondientes.
```javascript
function reactive(states) {
    Object.keys(states).forEach(state => {
        let value = states[state]
        // hace un wrapper con defineProperty del objeto "states" por medio de "get" y "set".
        Object.defineProperty(states, state, {
            get() {
                return value
            },
            // por medio de "set" se optiene el nuevo valor para el estado.
            set(newValue) {
                const oldValue = value
                if (isEveryPrimitives(newValue, oldValue) && newValue === oldValue) {
                    return
                }

                if (isEveryObjects(newValue, oldValue) && isEqualsObject(newValue, oldValue)) {
                    return
                }
                value = newValue
                // se notifica el cambio de estado.
                dependency.notify(state, newValue, oldValue)
            }
        })
    })
    return states
}
```
### La funcion reactive 
Recorre cada propiedad del objeto states y define cómo se deben manejar los accesos y actualizaciones de esas propiedades:

- **Getter**: Simplemente retorna el valor actual de la propiedad.
- **Setter**: Cuando se asigna un nuevo valor, el setter compara el nuevo valor con el antiguo para determinar si hay un cambio significativo. Si hay un cambio, actualiza el valor y llama a dependency.notify para informar a los observadores del cambio.

#### Argumentos

1. **`state`**:
   - **Tipo:** `Object`
   - **Descripción:** `state` es un objeto con los valores inicales para los estados. 


### Funciones auxiliares:

- **isEveryPrimitives**: Verifica si ambos valores son primitivos (números, cadenas, etc.).
- **isEveryObjects**: Verifica si ambos valores son objetos.
- **isEqualsObject**: Compara si dos objetos tienen el mismo contenido.

## Paso 3: La funcion watchEffect
watchEffect permite a los usuarios registrar una función que debe ejecutarse cada vez que se detecta un cambio en el estado. Esto es útil para actualizar automáticamente la interfaz de usuario u otras partes del sistema en respuesta a cambios.

```javascript
function watchEffect(callback) {
    // suscribe y ejecuta la funcion callback a todos estados.
    dependency.subscribe(callback)
    callback()
}
```

#### Argumentos

1. **`callback`**:
   - **Tipo:** `Function`
   - **Descripción:** `callback` es una funcion que va a registrarse a cualquier cambio de estado. 

- **Registro**: La función callback se agrega a la lista de observadores mediante dependency.subscribe.
- **Ejecución Inicial**: Después de registrar la función, se llama inmediatamente para ejecutar el efecto con el estado actual. Esto asegura que la función refleje el estado actual desde el principio y se actualice cuando el estado cambie.

## Paso 4: La funcion watch
watch se utiliza para observar cambios en un estado específico y ejecutar una función (callback) cuando se produce un cambio en ese estado. Esto es útil para realizar acciones específicas en respuesta a cambios en partes concretas del estado.

```javascript
function watch(callback, state) {
    // filtra entre la lista de observadores buscando el estado.
    const effect = dependency.observers
        .filter(effect => typeof effect !== 'function')
        .filter(effect => effect.state === state)
    // si el estado ya se encuentra en la lista de observadores retorna.
    if (effect.length) return
    // pero si no existe lo suscribe.
    dependency.subscribe({ state, callback })
}
```
#### Argumentos

1. **`callback`**:
   - **Tipo:** `Function`
   - **Descripción:** `callback` es una funcion que se ejecutara ante el cambio de un estado en especifico.
2. **`state`**:
   - **Tipo:** `string`
   - **Descripción:** `state` es el nombre del estado al cual nos queremos suscribir ante un cambio. 

- **Verificación de Efectos Existentes**: Filtra la lista de observadores para comprobar si ya existe un efecto que observe el estado específico.
- **Registro de Nuevo Efecto**: Si no hay efectos existentes para el estado dado, se agrega un nuevo objeto observador con el estado y el callback a la lista de observadores.
- **Ejecución**: El callback se ejecutará automáticamente cuando el estado específico cambie, permitiendo una reacción precisa a esos cambios.

# Renderizando nuestro componente
### Sistema de Componentes y Ciclos de Vida en la Aplicación

En este paso, exploraremos cómo se gestiona el ciclo de vida de un componente y cómo se maneja el estado reactivo dentro de nuestra aplicación.

Deberia tener la siguiente estructura en la seccion `createApp`:
```javascript
function createApp(component, container) {
    // variable para comprobar si el componente esta montado en el DOM.
    let isMounted = false
    // variable para guardar el arbol antiguo.
    let oldTree
    const { data } = component
    // se crea un context para el template con estados, metodos y propiedades computadas.
    const context = Object.assign({ context: reactive(data) }, component)

    function render() {
        // cambia el contexto de render para que su template tenga acceso a este contexto.
        this.render = this.render.bind(this.context)

        
        if (this.methods) {
            Object.entries(this.methods).forEach(([name, method]) => {
                // cambia con el metodo bind el contexto de las funciones del objeto methods.
                this.context[name] = ()=> method.call(this.context)
            })
        }

        if(this.computed){
            Object.entries(this.computed).forEach(([name, computed]) => {
                // cambia con el metodo bind el contexto de las funciones del objeto computed.
                this.context[name] = computed.call(this.context)
            })
        }

        if (this.watch) {
            // registra los watch del componente.
            Object.entries(this.watch).forEach(([state, callback]) => {
                watch(callback, state)
            })
        }

        // se verifica si el componente esta o no montado en el DOM.
        if (!isMounted) {
            // si no esta montado lo monta con "mount".
            oldTree = this.render(h)
            mount(oldTree, container)

            isMounted = true
            // ejecuta el metodo mounted de su componente.
            if (this.mounted) this.mounted.call(this.context)
        } else {
            // si ya esta montado lo actualiza con "diff".
            const newTree = this.render(h)
            diff(oldTree,newTree,container)
            oldTree = newTree
            // ejecuta el metodo updated de su componente cada vez que un estado cambie.
            if (this.updated) this.updated.call(this.context)
        }
    }
    // escucha cualquier cambio de estado y ejecuta render.
    watchEffect(render.bind(context))
}
```
#### `createApp`: El Iniciador de la Aplicación

La función `createApp` es el núcleo donde se inicializa y gestiona un componente. Acepta dos parámetros principales:

- **`component`**: Este es un objeto que describe las propiedades del componente, tales como el estado (`data`), métodos (`methods`), propiedades calculadas (`computed`), y observadores (`watch`).
- **`container`**: El contenedor DOM donde se montará el componente.

#### Estado Reactivo con `reactive`

La función `reactive` juega un papel fundamental en la gestión del estado. Convierte el objeto `data` del componente en un objeto reactivo, lo que significa que cualquier cambio en sus propiedades desencadenará automáticamente una actualización en la interfaz de usuario. Esto se logra utilizando `Object.defineProperty` para interceptar las operaciones de lectura (`get`) y escritura (`set`) en las propiedades del objeto.

Cuando se cambia una propiedad del objeto reactivo, la función `set` en `reactive` se asegura de que los observadores sean notificados de este cambio. Esto, a su vez, desencadena una nueva renderización del componente, si es necesario.

#### Contexto Compartido

El contexto del componente es esencialmente un espacio de trabajo que unifica el estado reactivo, los métodos y otras propiedades del componente. Para lograr esto, `createApp` combina el objeto reactivo creado a partir de `data` con otros aspectos del componente, como métodos y propiedades computadas.

Esto se hace mediante la creación de un objeto `context`, que luego se utiliza en la renderización del componente. Dentro de este contexto, los métodos y propiedades computadas se enlazan (bind) al contexto reactivo, asegurando que cualquier referencia a `this` dentro de esos métodos se refiera al objeto reactivo y no al objeto global o a otro contexto.

#### Ciclos de Vida del Componente

La función `createApp` también maneja los ciclos de vida del componente, incluyendo:

- **`mounted`**: Se ejecuta después de que el componente se ha renderizado por primera vez y se ha montado en el DOM. Este ciclo de vida es útil para ejecutar código que depende de la existencia del componente en el DOM, como la inicialización de plugins o la manipulación directa del DOM.
  
- **`updated`**: Se llama cada vez que el componente se actualiza debido a cambios en el estado reactivo. Este ciclo de vida permite ejecutar lógica adicional después de que el componente se haya vuelto a renderizar.

Estos ciclos de vida permiten al desarrollador engancharse en momentos clave del ciclo de vida del componente para ejecutar lógica específica.
En resumen, `createApp` establece un contexto unificado y reactivo para un componente, gestiona su ciclo de vida y asegura que cualquier cambio en el estado reactivo se refleje automáticamente en la interfaz de usuario. Esto proporciona una base sólida para crear aplicaciones dinámicas y reactivas con un enfoque simplificado.
