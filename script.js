// Inicializa o VLibras
window.onload = function() {
    if (window.location.protocol !== 'file:') {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
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
        
        // A MÁGICA ESTÁ AQUI:
        reconhecimento.continuous = true; // Fica ouvindo até você mandar parar
        reconhecimento.interimResults = true; // Escreve enquanto você fala

        reconhecimento.onresult = (event) => {
            let textoTranscrito = '';
            for (let i = 0; i < event.results.length; i++) {
                textoTranscrito += event.results[i][0].transcript;
            }
            textoReconhecido.innerText = textoTranscrito;
        };

        reconhecimento.onerror = (event) => {
            statusEl.innerText = 'ERRO MICROFONE: ' + event.error;
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
                // Se estiver ouvindo, para
                reconhecimento.stop();
            } else {
                // se não estiver, começa
                try {
                    ouvindo = true;
                    btnMicrofone.classList.add('ouvindo');
                    btnMicrofone.innerText = '🛑 Parar';
                    statusEl.innerText = 'Ouvindo... (clique em parar quando terminar)';
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

        btnEnviar.addEventListener('click', () => {
            const texto = textoReconhecido.innerText;
            if (!texto) return;

            statusEl.innerText = 'Enviando para o boneco...';
            
            try {
                const vlibrasInput = document.querySelector('.vpw-text-field');
                const vlibrasBtn = document.querySelector('.vpw-translate-btn');
                
                if (vlibrasInput && vlibrasBtn) {
                    vlibrasInput.value = texto;
                    vlibrasInput.dispatchEvent(new Event('input', { bubbles: true }));
                    vlibrasBtn.click();
                    statusEl.innerText = 'Articulando sinais!';
                } else {
                    statusEl.innerText = 'Abra o boneco no canto direito!';
                    selecionarTexto(textoReconhecido);
                }
            } catch (e) {
                statusEl.innerText = 'Erro ao enviar.';
            }
        });
    }
}

function selecionarTexto(elemento) {
    const range = document.createRange();
    range.selectNodeContents(elemento);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}