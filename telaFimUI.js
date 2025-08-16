import * as THREE from "three";

const telaFimUI = {
    el: null,
    tempoEl: null,
    tempo: 5,
    init: function () {
        this.el = document.querySelector("#tela-fim");
        this.tempoEl = document.querySelector('#tempo-tela-fim');
    },
    aparece: function () {
        this.el.style.opacity = "1"

        window.setTimeout(() => {
            window.location.reload();
        }, this.tempo * 1000)
        
    },
    remove: function () {
        this.el.style.opacity = "0"
    },
};

export default telaFimUI;
