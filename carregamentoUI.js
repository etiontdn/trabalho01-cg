const carregamentoUI = {
    el: null,
    barra: null,
    texto: null,
    progresso: 0,
    finalizado: false,
    init: function () {
        this.el = document.querySelector("#tela-de-carregamento");
        this.barra = document.querySelector('#frente-barra');
        this.texto = document.querySelector('#espaco-para-iniciar');
    },
    remove: function () {
        this.el.style.transform = "translateY(-100vh)"
        this.el.style.opacity = "0"
    },
    finaliza: function () {
        this.finalizado = true;
        this.texto.textContent = "Aperte espaço para iniciar!"
    },
    setProgresso: function (n) {
        this.progresso = n;
        if (this.progresso >= 100) {
            this.progresso = 100;
        }
        this.barra.style.width = this.progresso * 100 + "%";
    }

};

export default carregamentoUI;
