// ==========================================
// CONFIGURAÇÕES DE LOGIN (Admin / Pazolini2026)
// Para gerar novos Hashes SHA-256 no futuro, você pode usar: https://emn178.github.io/online-tools/sha256.html
// ==========================================
// Hash de "admin"
const USER_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
// Hash de "Pazolini2026"
const PASS_HASH = "1f7a0b38c035677e4fbced4b5bc26d0bb5ed9dcbf67eb2e3c04870f72aeed42e";

// Função para encriptar os inputs do usuário em SHA-256 no navegador via CryptoJS
function sha256(message) {
    return CryptoJS.SHA256(message).toString();
}

// Permite "Enter" para logar e foca no usuario
document.getElementById('username').focus();
document.getElementById('password').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') tentarLogin();
});
document.getElementById('username').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') document.getElementById('password').focus();
});

function tentarLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const erroEl = document.getElementById('login-error');

    if (!user || !pass) {
        erroEl.textContent = "Preencha ambos os campos.";
        return;
    }

    try {
        // Geramos o hash "criptografado" para ver se bate e é idêntico
        const inputUserHash = sha256(user);
        const inputPassHash = sha256(pass);

        if (inputUserHash === USER_HASH && inputPassHash === PASS_HASH) {
            // Remove o aviso de erro, se houver
            erroEl.textContent = "";

            // Faz a transição de saída do Login (Animação suave de fade out)
            const overlay = document.getElementById('login-overlay');
            overlay.style.transition = "opacity 0.4s ease";
            overlay.style.opacity = "0";

            setTimeout(() => {
                overlay.style.display = 'none';
                // Mostra o Painel com um Fade-In
                const mainApp = document.getElementById('main-app');
                mainApp.style.display = 'block';
                mainApp.style.animation = "fadeIn 0.5s ease";

                // SÓ AGORA chama os dados! Assim poupamos servidor do N8N
                carregarDados();
            }, 400);

        } else {
            erroEl.textContent = "Usuário ou senha incorretos.";
        }
    } catch (e) {
        console.error("Erro interno no login:", e);
        erroEl.textContent = "Erro na validação do login.";
    }
}

// Animação de entrada
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

// ==========================================
// INTEGRAÇÃO N8N (SÓ RODA SE LOGADO)
// ==========================================
const N8N_WEBHOOK_URL = 'https://n8n.popify.com.br/webhook/dados';

async function carregarDados() {
    try {
        const response = await fetch(N8N_WEBHOOK_URL);
        if (!response.ok) throw new Error('Erro ao buscar dados do n8n');

        let dados = await response.json();

        if (Array.isArray(dados) && dados.length > 0 && Array.isArray(dados[0])) {
            dados = dados.flat();
        }

        renderizarTabela(dados);
        document.getElementById('contador').textContent = `${dados.length} cadastro(s) encontrados na base`;

    } catch (erro) {
        console.error("Erro na requisição:", erro);
        document.getElementById('tabela-corpo').innerHTML = `
            <tr><td colspan="7" class="error">
                Erro ao carregar dados do n8n.<br>
                Verifique se a URL está correta e se a opção CORS (Respond CORS) está ativada no Webhook!
            </td></tr>
        `;
        document.getElementById('contador').textContent = "Falha na sincronização.";
    }
}

function formatarDataHora(dataString) {
    if (!dataString) return '-';
    try {
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ' às');
    } catch (e) {
        return dataString;
    }
}

function formatarTelefone(telefone) {
    if (!telefone) return '-';
    return telefone.replace('@s.whatsapp.net', '').trim();
}

function renderizarTabela(dados) {
    const tbody = document.getElementById('tabela-corpo');
    tbody.innerHTML = '';

    if (!dados || dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Nenhum cadastro encontrado.</td></tr>';
        return;
    }

    dados.forEach(item => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td><span class="id-badge">#${item.id || '-'}</span></td>
            <td style="color: #64748B;">${formatarDataHora(item.createdAt)}</td>
            <td style="color: #0F172A; font-weight: 600;">${item.Nome || '-'}</td>
            <td>${item.Cidade || '-'}</td>
            <td>${item.Area || '-'}</td>
            <td>${formatarTelefone(item.Telefone)}</td>
            <td class="ideia-cell" title="${item.Ideia || ''}">${item.Ideia || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}
