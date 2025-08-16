const chavesUI = {
    el: null,
    init: function () {
        this.el = document.querySelector("#chaves-container");
    },
    adicionarChave1: function () {
        if (!document.querySelector("#chave-1")) {
            const novaChave = document.createElement("div");
            novaChave.id = "chave-1";
            this.el.appendChild(novaChave);
        }
    },
    adicionarChave2: function () {
        if (!document.querySelector("#chave-2")) {
            const novaChave = document.createElement("div");
            novaChave.id = "chave-2";
            this.el.appendChild(novaChave);
        }
    },
    adicionarChave3: function () {
        if (!document.querySelector("#chave-3")) {
            const novaChave = document.createElement("div");
            novaChave.id = "chave-3";
            this.el.appendChild(novaChave);
        }
    },
};

export default chavesUI;
