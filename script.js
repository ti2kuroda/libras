// Inicializa o VLibras com segurança
window.onload = function() {
    if (window.VLibras) {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
    } else {
        // Tenta novamente em 1 segundo se a internet tiver demorado para carregar o script
        setTimeout(window.onload, 1000);
    }
};

const btnMicrofone = document.getElementById('btn-microfone');
const btnEnviar = document.getElementById('btn-enviar');
const textoReconhecido = document.getElementById('texto-reconhecido');
const statusEl = document.getElementById('status');

let reconhecimento;
let ouvindo = false;

if (!btnMicrofone || !btnEnviar || !textoReconhecido || !statusEl) {
    console.error("Erro: Elementos HTML não encontrados.");
} else {
    btnEnviar.disabled = true;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        statusEl.innerText = 'Navegador não suporta voz. Use Chrome.';
        statusEl.style.color = 'red';
        btnMicrofone.disabled = true;
    } else {
        reconhecimento = new SpeechRecognition();
        reconhecimento.lang = 'pt-BR';
        reconhecimento.continuous = true; 
        reconhecimento.interimResults = true;

        reconhecimento.onresult = (event) => {
            let textoTranscrito = '';
            for (let i = 0; i < event.results.length; i++) {
                textoTranscrito += event.results[i][0].transcript;
            }
            textoReconhecido.innerText = textoTranscrito;
        };

        reconhecimento.onerror = (event) => {
            statusEl.innerText = 'ERRO: ' + event.error;
            statusEl.style.color = 'red';
            ouvindo = false;
            btnMicrofone.classList.remove('ouvindo');
            btnMicrofone.innerText = '🎤 Falar';
        };

        reconhecimento.onend = () => {
            ouvindo = false;
            btnMicrofone.classList.remove('ouvindo');
            btnMicrofone.innerText = '🎤 Falar';
            statusEl.style.color = 'white';
            
            if (textoReconhecido.innerText.trim() !== '') {
                statusEl.innerText = 'Pronto para enviar!';
                btnEnviar.disabled = false;
            } else {
                statusEl.innerText = 'Nenhuma fala detectada.';
            }
        };

        btnMicrofone.addEventListener('click', () => {
            if (ouvindo) {
                reconhecimento.stop();
            } else {
                try {
                    ouvindo = true;
                    btnMicrofone.classList.add('ouvindo');
                    btnMicrofone.innerText = '🛑 Parar';
                    statusEl.innerText = 'Ouvindo...';
                    statusEl.style.color = 'white';
                    textoReconhecido.innerText = '';
                    btnEnviar.disabled = true;
                    
                    reconhecimento.start();
                } catch (e) {
                    statusEl.innerText = 'ERRO: ' + e.message;
                    statusEl.style.color = 'red';
                    ouvindo = false;
                    btnMicrofone.classList.remove('ouvindo');
                    btnMicrofone.innerText = '🎤 Falar';
                }
            }
        });

        // Método oficial e nativo do VLibras: Selecionar o texto na tela
        btnEnviar.addEventListener('click', () => {
            const texto = textoReconhecido.innerText;
            if (!texto) return;

            statusEl.innerText = 'Traduzindo...';
            
            // Seleciona o texto do campo para o VLibras ler
            const range = document.createRange();
            range.selectNodeContents(textoReconhecido);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            
            // Dispara o evento que o VLibras escuta para saber que um texto foi selecionado
            document.dispatchEvent(new MouseEvent('mouseup', { 
                bubbles: true, 
                cancelable: true, 
                view: window 
            }));
            
            statusEl.innerText = 'Boneco aberto? Se sim, ele vai articular!';
        });
    }
}