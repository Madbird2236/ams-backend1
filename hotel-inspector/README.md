# AMS HOTEL INSPECTOR

**Technical Inspection & Renovation Assessment** — AMS Swiss GmbH · https://ams.swiss

Aplicação web (PWA) para avaliar o estado de conservação de hotéis antes da aquisição ou renovação.
Funciona offline, guarda tudo localmente no dispositivo (IndexedDB), permite fotografias, classificação
de intervenções, análise automática, estimativa de investimento e exportação de um relatório PDF profissional.

Idiomas: Português · Deutsch · Italiano · English.

> A classificação produzida pela aplicação é uma avaliação preliminar e **não substitui** perícias estruturais,
> certificações técnicas ou verificações legais por profissional habilitado. A aplicação nunca inventa preços
> nem problemas não registados.

---

## Instalar e executar num Mac

### 1. Pré-requisitos (uma vez)

1. Instale o **Node.js LTS** (inclui o `npm`): https://nodejs.org — descarregue o instalador macOS e execute-o.
   Em alternativa, com Homebrew: `brew install node`.
2. Confirme no Terminal (Aplicações → Utilitários → Terminal):
   ```bash
   node -v   # deve mostrar v20 ou superior
   npm -v
   ```

### 2. Obter o código

```bash
git clone https://github.com/madbird2236/ams-backend1.git
cd ams-backend1
git checkout ccr-7d5086ea-aj6p39
cd hotel-inspector
```

### 3. Instalar dependências e arrancar em modo de desenvolvimento

```bash
npm install
npm run dev
```

Abra http://localhost:5173 no Safari ou Chrome.

Para testar no **iPhone/Android na mesma rede Wi-Fi**:

```bash
npm run dev -- --host
```

O Terminal mostra um endereço `Network: http://192.168.x.x:5173` — abra-o no telemóvel.
No iPhone, Safari → botão Partilhar → **Adicionar ao ecrã principal** instala a app como PWA.
(Nota: a câmara e o modo offline completo exigem HTTPS ou `localhost`; em rede local via HTTP a câmara
pode ser bloqueada pelo browser — use a opção "Adicionar foto" ou publique o build num servidor HTTPS.)

### 4. Build de produção

```bash
npm run build      # gera a pasta dist/
npm run preview    # serve dist/ em http://localhost:4173
```

A pasta `dist/` é estática: pode ser publicada em qualquer alojamento (Netlify, Vercel, Cloudflare Pages,
servidor próprio com HTTPS). Com HTTPS a PWA fica instalável e funciona 100% offline.

---

## Estrutura do projeto

```
hotel-inspector/
├── src/
│   ├── data/checklist.ts      # catálogo técnico (8 categorias, ~80 elementos)
│   ├── db/                    # Dexie (IndexedDB) + hooks reativos
│   ├── i18n/                  # dicionários PT / DE / IT / EN
│   ├── lib/
│   │   ├── analysis.ts        # análise automática e conclusão preliminar (regras transparentes)
│   │   ├── budget.ts          # estimativa de investimento (A–E)
│   │   ├── pdf.ts             # relatório PDF (jsPDF + autotable)
│   │   ├── exportImport.ts    # backup / importação JSON
│   │   └── photos.ts          # redimensionamento e compressão de fotografias
│   ├── pages/                 # Home, Hotel, Checklist, Categoria, Avaliação, Resumo, Orçamento, Relatório
│   └── components/            # UI partilhada
├── public/                    # ícones PWA
└── vite.config.ts             # Vite + Tailwind v4 + PWA (service worker)
```

Stack: React 19 · TypeScript · Tailwind CSS v4 · Vite · Dexie · jsPDF · vite-plugin-pwa.

## Fluxo de utilização

1. **Nova inspeção** → introduzir dados do hotel (campos podem ser marcados como "Desconhecido").
2. **Checklist** → escolher a área (A–H). Quartos e casas de banho permitem várias unidades (ex.: Quarto 101, 102…).
3. Em cada elemento: **Estado** → a app sugere Tipo de intervenção e Prioridade (alteráveis), fotografias,
   descrição, dimensões, quantidade, materiais, especialidade, custo preliminar, grau de confiança.
4. **Resumo** → problemas críticos, trabalhos necessários/recomendados, elementos que podem permanecer,
   melhorias opcionais, áreas não avaliadas, verificações pendentes, riscos financeiros e conclusão preliminar.
5. **Orçamento** → moeda EUR/CHF, contingência, impostos; linhas automáticas (a partir dos custos do checklist)
   e linhas manuais; marcação de "Pressuposto".
6. **Relatório** → PDF com 13 secções, no idioma escolhido.

## Regras da conclusão preliminar

| Conclusão | Regra (apenas dados registados) |
|---|---|
| Informações insuficientes | cobertura < 40 % dos elementos, ou Estrutura / Instalações técnicas / Segurança com < 50 % verificados |
| Renovação profunda | qualquer P0, ou ≥ 25 % dos elementos avaliados a substituir, ou ≥ 30 % com intervenção necessária |
| Renovação parcial | existe intervenção necessária, ou P1, ou ≥ 15 % a reparar/substituir |
| Aparentemente bem conservado | nenhum dos anteriores |

## Segurança dos dados

- Tudo fica no dispositivo (IndexedDB). Não há conta nem servidor.
- A app pede ao browser armazenamento persistente; mesmo assim, **exporte backups JSON regularmente**
  (botão *Backup* no ecrã inicial ou *Exportar esta inspeção* na aba Relatório). O JSON inclui as fotografias.
- *Importar backup* repõe tudo noutro dispositivo.
