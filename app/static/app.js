const API_BASE = '';  

const state = {
  currentSection: 'dashboard',
  counts: {
    clientes: 0,
    pets: 0,
    fornecedores: 0,
    produtos: 0,
    servicos: 0,
    vendas: 0,
  },
};

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initForms();
  initMobileMenu();
  showSection('dashboard');
});

function initNavigation() {
  document.querySelectorAll('.nav-item[data-section]').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      showSection(section);
      closeMobileMenu();
    });
  });
}

function showSection(sectionId) {
  document.querySelectorAll('.nav-item[data-section]').forEach((item) => {
    item.classList.toggle('active', item.dataset.section === sectionId);
  });

  document.querySelectorAll('.page-section').forEach((section) => {
    section.classList.toggle('active', section.id === `section-${sectionId}`);
  });

  const titles = {
    dashboard: 'Dashboard',
    clientes: 'Clientes',
    pets: 'Pets',
    fornecedores: 'Fornecedores',
    produtos: 'Produtos',
    servicos: 'Serviços',
    vendas: 'Vendas',
  };
  document.getElementById('header-title').innerHTML = titles[sectionId] || 'PetVida';

  state.currentSection = sectionId;

  if (sectionId === 'dashboard') {
    loadDashboard();
  } else {
    loadSectionData(sectionId);
    if (sectionId === 'vendas') {
      loadProdutosSelect();
      loadClientesSelect();
    } else if (sectionId === 'produtos') {
      loadFornecedoresSelect();
    } else if (sectionId === 'servicos') {
      loadPetsSelect();
    }
  }
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('sidebar-overlay');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      overlay.classList.toggle('show');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }
}

function closeMobileMenu() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

async function loadDashboard() {
  const endpoints = ['clientes', 'pets', 'fornecedores', 'produtos', 'servicos', 'vendas'];

  const results = await Promise.allSettled(
    endpoints.map((ep) => apiFetch(`/${ep}`))
  );

  results.forEach((result, idx) => {
    const key = endpoints[idx];
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      state.counts[key] = result.value.length;
    } else {
      state.counts[key] = 0;
    }
    const el = document.getElementById(`count-${key}`);
    if (el) animateCount(el, state.counts[key]);
  });

  endpoints.forEach((ep) => {
    const badge = document.querySelector(`.nav-item[data-section="${ep}"] .nav-badge`);
    if (badge) badge.textContent = state.counts[ep];
  });
}

function animateCount(el, target) {
  const duration = 600;
  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + diff * eased);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

async function loadProdutosSelect() {
  const select = document.getElementById('venda-id-produto');
  if (!select) return;

  try {
    const produtos = await apiFetch('/produtos');
    const currentVal = select.value;

    select.innerHTML = '<option value="">Selecione um produto...</option>';

    if (Array.isArray(produtos)) {
      produtos.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id_produto;
        option.textContent = `${p.nome} (R$ ${parseFloat(p.preco).toFixed(2)})`;
        select.appendChild(option);
      });
    }

    if (currentVal) select.value = currentVal;
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
  }
}

async function loadClientesSelect() {
  const select = document.getElementById('venda-id-cliente');
  if (!select) return;

  try {
    const clientes = await apiFetch('/clientes');
    const currentVal = select.value;

    select.innerHTML = '<option value="">Selecione um Cliente...</option>';

    if (Array.isArray(clientes)) {
      clientes.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id_cliente;
        option.textContent = `${c.nome}`;
        select.appendChild(option);
      });
    }

    if (currentVal) select.value = currentVal;
  } catch (err) {
    console.error('Erro ao carregar clientes:', err);
  }
}

async function loadFornecedoresSelect() {
  const select = document.getElementById('produto-id-fornecedor');
  if (!select) return;

  try {
    const fornecedores = await apiFetch('/fornecedores');
    const currentVal = select.value;

    select.innerHTML = '<option value="">Selecione um fornecedor...</option>';

    if (Array.isArray(fornecedores)) {
      fornecedores.forEach(f => {
        const option = document.createElement('option');
        option.value = f.id_fornecedor;
        option.textContent = `${f.nome}`;
        select.appendChild(option);
      });
    }

    if (currentVal) select.value = currentVal;
  } catch (err) {
    console.error('Erro ao carregar fornecedores:', err);
  }
}

async function loadPetsSelect() {
  const select = document.getElementById('servico-id-pet');
  if (!select) return;

  try {
    const pets = await apiFetch('/pets');
    const currentVal = select.value;

    select.innerHTML = '<option value="">Selecione um pet...</option>';

    if (Array.isArray(pets)) {
      pets.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id_pet;
        option.textContent = `${p.nome} (${p.tipo})`;
        select.appendChild(option);
      });
    }

    if (currentVal) select.value = currentVal;
  } catch (err) {
    console.error('Erro ao carregar pets:', err);
  }
}

async function loadSectionData(section) {
  const tableBody = document.getElementById(`table-${section}`);
  if (!tableBody) return;

  tableBody.innerHTML = `
    <tr>
      <td colspan="20">
        <div class="loading-overlay">
          <div class="spinner"></div>
          Carregando dados...
        </div>
      </td>
    </tr>`;

  try {
    const data = await apiFetch(`/${section}`);
    renderTable(section, data);

    if (Array.isArray(data)) {
      state.counts[section] = data.length;
      const countEl = document.getElementById(`count-${section}`);
      if (countEl) countEl.textContent = data.length;
      const badge = document.querySelector(`.nav-item[data-section="${section}"] .nav-badge`);
      if (badge) badge.textContent = data.length;
    }
  } catch (err) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="20">
          <div class="table-empty">
            <div class="empty-icon"></div>
            <p>Erro ao carregar dados: ${err.message}</p>
          </div>
        </td>
      </tr>`;
  }
}

function renderTable(section, data) {
  const tableBody = document.getElementById(`table-${section}`);
  if (!tableBody) return;

  if (!data || data.length === 0) {
    const emptyIcons = {
      clientes: '',
      pets: '',
      fornecedores: '',
      produtos: '',
      servicos: '',
      vendas: '',
    };
    tableBody.innerHTML = `
      <tr>
        <td colspan="20">
          <div class="table-empty">
            <div class="empty-icon">${emptyIcons[section] || ''}</div>
            <p>Nenhum registro encontrado</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  const renderers = {
    clientes: renderClientesRow,
    pets: renderPetsRow,
    fornecedores: renderFornecedoresRow,
    produtos: renderProdutosRow,
    servicos: renderServicosRow,
    vendas: renderVendasRow,
  };

  const renderer = renderers[section];
  tableBody.innerHTML = data.map((item) => renderer(item)).join('');
}

function renderClientesRow(c) {
  return `<tr>
    <td><span class="id-badge">${c.id_cliente}</span></td>
    <td><strong>${esc(c.nome)}</strong></td>
    <td>${esc(c.telefone)}</td>
    <td>${esc(c.email)}</td>
  </tr>`;
}

function renderPetsRow(p) {
  const tipoIcon = {
    cachorro: '',
    gato: '',
    ave: '',
    peixe: '',
    coelho: '',
    hamster: '',
  };
  const icon = tipoIcon[(p.tipo || '').toLowerCase()] || '';
  return `<tr>
    <td><span class="id-badge">${p.id_pet}</span></td>
    <td><strong>${icon} ${esc(p.nome)}</strong></td>
    <td><span class="tag tag-blue">${esc(p.tipo)}</span></td>
    <td>${p.idade} ${p.idade === 1 ? 'ano' : 'anos'}</td>
    <td><span class="id-badge">${p.id_cliente}</span></td>
  </tr>`;
}

function renderFornecedoresRow(f) {
  return `<tr>
    <td><span class="id-badge">${f.id_fornecedor}</span></td>
    <td><strong>${esc(f.nome)}</strong></td>
    <td>${esc(f.telefone)}</td>
    <td>${esc(f.email)}</td>
    <td>${f.produtos ? `<span class="tag tag-green">${esc(f.produtos)}</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
  </tr>`;
}

function renderProdutosRow(p) {
  return `<tr>
    <td><span class="id-badge">${p.id_produto}</span></td>
    <td><strong>${esc(p.nome)}</strong></td>
    <td>${esc(p.descricao)}</td>
    <td><span class="price">R$ ${parseFloat(p.preco).toFixed(2)}</span></td>
    <td><span class="tag tag-orange">${p.estoque} un.</span></td>
    <td><span class="id-badge">${p.id_fornecedor}</span></td>
  </tr>`;
}

function renderServicosRow(s) {
  return `<tr>
    <td><span class="id-badge">${s.id_servico}</span></td>
    <td><strong>${esc(s.tipo_servico)}</strong></td>
    <td>${formatDate(s.data)}</td>
    <td><span class="price">R$ ${parseFloat(s.valor).toFixed(2)}</span></td>
    <td><span class="id-badge">${s.id_pet}</span></td>
  </tr>`;
}

function renderVendasRow(v) {
  return `<tr>
    <td><span class="id-badge">${v.id_venda}</span></td>
    <td>${v.quantidade}</td>
    <td>${formatDate(v.data)}</td>
    <td><span class="price">R$ ${parseFloat(v.valor).toFixed(2)}</span></td>
    <td><span class="id-badge">${v.id_produto}</span></td>
    <td><span class="id-badge">${v.id_cliente}</span></td>
  </tr>`;
}

function initForms() {
  bindForm('form-cliente', '/cadastro-cliente', 'clientes', [
    'nome', 'telefone', 'email',
  ]);

  bindForm('form-pet', '/cadastro-pet', 'pets', [
    'nome', 'tipo', 'idade', 'id_cliente',
  ], { idade: 'int', id_cliente: 'int' });

  bindForm('form-fornecedor', '/cadastro-fornecedor', 'fornecedores', [
    'nome', 'telefone', 'email', 'produtos',
  ]);

  bindForm('form-produto', '/cadastro-produto', 'produtos', [
    'nome', 'descricao', 'preco', 'estoque', 'id_fornecedor',
  ], { preco: 'float', estoque: 'int', id_fornecedor: 'int' });

  bindForm('form-servico', '/cadastro-servico', 'servicos', [
    'tipo_servico', 'data', 'valor', 'id_pet',
  ], { valor: 'float', id_pet: 'int' });

  bindForm('form-venda', '/cadastro-venda', 'vendas', [
    'quantidade', 'data', 'valor', 'id_produto', 'id_cliente',
  ], { quantidade: 'int', valor: 'float', id_produto: 'int', id_cliente: 'int' });
}

function bindForm(formId, endpoint, section, fields, types = {}) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="spinner"></div> Salvando...';
    submitBtn.disabled = true;

    const body = {};
    let hasError = false;

    fields.forEach((field) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (!input) return;
      let value = input.value.trim();

      if (!value && field !== 'produtos') {
        hasError = true;
        input.style.borderColor = 'var(--danger)';
        setTimeout(() => (input.style.borderColor = ''), 2000);
        return;
      }

      if (types[field] === 'int') value = parseInt(value, 10);
      else if (types[field] === 'float') value = parseFloat(value);

      if (value !== '' || field === 'produtos') {
        body[field] = value || undefined;
      }
    });

    if (hasError) {
      showToast('Preencha todos os campos obrigatórios', 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      return;
    }

    try {
      const result = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      showToast(result.mensagem || 'Cadastrado com sucesso!', 'success');
      form.reset();
      loadSectionData(section);
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

async function apiFetch(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || `Erro ${response.status}`);
  }

  return data;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '',
    error: '',
    info: '',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || ''}</span>
    <span>${esc(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-removing');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function esc(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [y, m, d] = parts.split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}
