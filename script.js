// Inicializa o VLibras assim que o script dele estiver pronto.
// Não usa window.onload: o vlibras-plugin.js carrega um script de fallback
// via CDN que às vezes fica pendente/travado, e isso impede o evento "load"
// da página de disparar — o que travaria essa inicialização para sempre.
(function iniciarVLibras() {
    if (window.VLibras) {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
    } else {
        setTimeout(iniciarVLibras, 500);
    }
})();

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

        reconhecimento.onstart = () => {
            console.log('[libras] reconhecimento iniciado');
        };

        reconhecimento.onresult = (event) => {
            let textoTranscrito = '';
            for (let i = 0; i < event.results.length; i++) {
                textoTranscrito += event.results[i][0].transcript;
            }
            console.log('[libras] onresult:', textoTranscrito);
            textoReconhecido.innerText = textoTranscrito;
        };

        reconhecimento.onerror = (event) => {
            console.error('[libras] onerror:', event.error, event.message);
            statusEl.innerText = 'ERRO: ' + event.error;
            statusEl.style.color = 'red';
            ouvindo = false;
            btnMicrofone.classList.remove('ouvindo');
            btnMicrofone.innerText = '🎤 Falar';
        };

        reconhecimento.onend = () => {
            console.log('[libras] onend, texto atual:', JSON.stringify(textoReconhecido.innerText));
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
                    
                    console.log('[libras] chamando reconhecimento.start()');
                    reconhecimento.start();
                } catch (e) {
                    console.error('[libras] exceção ao chamar start():', e);
                    statusEl.innerText = 'ERRO: ' + e.message;
                    statusEl.style.color = 'red';
                    ouvindo = false;
                    btnMicrofone.classList.remove('ouvindo');
                    btnMicrofone.innerText = '🎤 Falar';
                }
            }
        });

        function enviarSelecaoParaVLibras() {
            const texto = textoReconhecido.innerText;
            if (!texto) return;

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

            statusEl.innerText = 'Traduzindo!';
        }

        // Método oficial e nativo do VLibras: Selecionar o texto na tela
        btnEnviar.addEventListener('click', () => {
            const texto = textoReconhecido.innerText;
            if (!texto) return;

            statusEl.innerText = 'Abrindo o boneco...';

            const accessButton = document.querySelector('[vw-access-button]');
            const wrapper = document.querySelector('[vw-plugin-wrapper]');
            const jaAberto = wrapper && wrapper.classList.contains('active');

            if (accessButton && !jaAberto) {
                accessButton.click();
                // dá tempo do widget renderizar o iframe antes de enviar o texto
                setTimeout(enviarSelecaoParaVLibras, 800);
            } else {
                enviarSelecaoParaVLibras();
            }
        });
    }
}