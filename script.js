// Inicializa o VLibras e tenta abrir o boneco automaticamente
window.onload = function() {
    if (window.location.protocol !== 'file:') {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
        
        // Espera 3 segundos para o VLibras carregar e clica no botão de acesso sozinho
        setTimeout(() => {
            const btnAcessoVlibras = document.querySelector('.vw-access-button');
            if (btnAcessoVlibras) {
                btnAcessoVlibras.click();
            }
        }, 3000);
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

        btnEnviar.addEventListener('click', () => {
            const texto = textoReconhecido.innerText;
            if (!texto) return;

            statusEl.innerText = 'Enviando para o boneco...';
            
            try {
                let vlibrasInput = document.querySelector('.vpw-text-field');
                let vlibrasBtn = document.querySelector('.vpw-translate-btn');
                
                // Se o boneco estiver fechado, abre ele primeiro
                if (!vlibrasInput || !vlibrasBtn) {
                    const btnAcessoVlibras = document.querySelector('.vw-access-button');
                    if (btnAcessoVlibras) btnAcessoVlibras.click();
                    
                    // Espera 1.5 segundos para a janela abrir e tenta encontrar os elementos de novo
                    setTimeout(() => {
                        vlibrasInput = document.querySelector('.vpw-text-field');
                        vlibrasBtn = document.querySelector('.vpw-translate-btn');
                        if (vlibrasInput && vlibrasBtn) {
                            vlibrasInput.value = texto;
                            vlibrasInput.dispatchEvent(new Event('input', { bubbles: true }));
                            vlibrasBtn.click();
                            statusEl.innerText = 'Articulando sinais!';
                        } else {
                            statusEl.innerText = 'Clique no ícone do VLibras no canto direito!';
                        }
                    }, 1500);
                } else {
                    // Se o boneco já estiver aberto, envia direto
                    vlibrasInput.value = texto;
                    vlibrasInput.dispatchEvent(new Event('input', { bubbles: true }));
                    vlibrasBtn.click();
                    statusEl.innerText = 'Articulando sinais!';
                }
            } catch (e) {
                statusEl.innerText = 'Erro ao enviar.';
            }
        });
    }
}