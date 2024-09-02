import JSConfetti from 'js-confetti'
import javascriptLogo from '/javascript.svg'
import viteLogo from '/vite.svg'
import './index.css'

const App = {
    // render recibe la funcion "h" por argumento y retorna un "vnode".
    render(h) {
        return h(
            'div', 
            { class: 'min-h-screen flex flex-col gap-y-6 justify-center items-center'},
            [
                h(
                    'div',
                    { class: 'flex gap-x-6'},
                    [
                        h(
                            'a',
                            {  href:'https://vitejs.dev', target:'_blank'},
                            h(
                                'img',
                                { src: viteLogo, class: 'logo w-24 h-24' }
                            )
                        ),
                        h(
                            'a',
                            {  href:'https://developer.mozilla.org/en-US/docs/Web/JavaScript', target:'_blank'},
                            h(
                                'img',
                                { src: javascriptLogo, class: 'logo vanilla w-24 h-24' }
                            )
                        )
                    ]
                ),
                h(
                    'h1',
                    { class: `font-sans font-bold text-center text-gray-800 ${this.count > 0 ?'text-3xl':'text-4xl'}`},
                    this.message
                ),
                h(
                    'button',
                    { onClick: this.counter, class: 'p-2 border-2 border-black rounded cursor-pointer' }, 
                    `count is ${this.count}`
                )
            ]
        )
    },
    data: {
        count: 0,
        jsConfetti: new JSConfetti()
    },
    mounted() {
        // puede agregar codigo que se ejecute cuando su componente es montado en el DOM.        
    },
    updated() {
        // puede agregar codigo que se ejecute cada vez que haya un cambio de estado.
    },
    methods: {
        counter(){
            this.count++
            if(this.count === 1){
                this.jsConfetti.addConfetti()
            }
        }
    },
    computed: {
        // puede agregar propiedades calculadas.
        message(){
            if(this.count > 0){
                return 'Felicidades ya tenes un mini framework! &#x1F680'
            }
            return 'Hello Vite!'
        }
    },
    watch: {
        // puede agregar watchers para los estados.
    }
}

export default App

