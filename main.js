import './style.css'
// altere a URL aqui
const APIURL = 'https://cafedas4.com.br/preview/brz'

// realizando a consulta inicial
async function init () {
  const code = await fetch(`${APIURL}/wp-json/api/team?page=1&per_page=8`, { mode: 'cors', cache: 'reload' })
  const req = await code.json()
  const { data: { team, max_pages, found_posts } } = req
  buildList(team)
  buildPagination(max_pages, found_posts, 1)
}
init()

// aqui monta o template da busca
function buildList (posts) {
  const htmlBase = document.querySelector('#advogados')
  const size = posts.length
  let advogados = ''
  for (var i = 0; i < size; i++) {
     advogados += `<li>
       <a href="${posts[i].link}">
         <span>
           <h2 class="list-search__title">${posts[i].title}</h2>
           <p class="list-search__office">${posts[i].office[0].name}</p>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path transform="translate(-84 -6479)" fill="#a65a2a" fill-rule="evenodd" d="M94,6499l-1.435-1.393,7.607-7.607H84v-2h16.172l-7.586-7.586L94,6479l10,10-10,10"></path>
           </svg>
       </a>
     </li>`
  }
  htmlBase.innerHTML = advogados
}

// construindo a paginação
function buildPagination (max_pages, found_posts, active_page) {
  const pagination = document.querySelector('#pagination')
  let pages = ''
  for (var i = 0; i < max_pages; i++) {
    pages += `<button data-page="${i + 1}" class="${active_page === (i + 1) ? 'active': ''}">${i + 1}</button>`
  }
  pagination.innerHTML = pages
  const paginateButtons = document.querySelectorAll('#pagination button');
  [...paginateButtons].forEach((el) => {
    el.addEventListener('click', (event) => {
      const page = +el.dataset.page
      const query = {
        s: document.querySelector('#search').value ?? null,
        team_area: document.querySelector('#team_area').value ?? null,
        team_office: document.querySelector('#team_office').value ?? null,
        page
      }
      filterTeam(query, page)
    })
  })
}

// fazendo a filtragem dos dados. o valor de data manda:
// page: a página ativa
// s: a busca pelo título
// team_area = a área de atuação
// team_office = o escritório que atende
// team_letter = a letra
// é possível a filtragem ocorrer com os três elementos. 
async function filterTeam (query, page) {
  // a query abaixo precisa ser construida da forma abaixo, se não o WP quebra as respostas.
  const buildQuery = (query.s.length > 0 ? `&name=${query.s}` : '') + (query.team_area.length > 0 ? `&team_area=${query.team_area}` : '') + (query.team_office.length > 0 ? `&team_office=${query.team_office}` : '')
  const code = await fetch(`${APIURL}/wp-json/api/team?page=${page}&per_page=8${buildQuery}`, { mode: 'cors', cache: 'reload' })
  const req = await code.json()
  const { data: { team, max_pages, found_posts } } = req
  buildList(team)
  buildPagination(max_pages, found_posts, page)

  // aqui limpa as letras
  const paginateButtons = document.querySelectorAll('#pagination button');
  for (var i = 0; i < letterButtons.length; i++) {
    letterButtons[i].classList.remove('active')
  }
}

if (document.querySelector('#filter_data')) {   
  document.querySelector('#filter_data').addEventListener('submit', (event) => {
    event.preventDefault();
    const query = {
      s: document.querySelector('#search').value ?? null,
      team_area: document.querySelector('#team_area').value ?? null,
      team_office: document.querySelector('#team_office').value ?? null,
      page: 1
    }
    filterTeam(query, 1)
  })
}

// pesquisa das letras
const letterButtons = document.querySelectorAll('#alfabeto button');
  [...letterButtons].forEach(async (el) => {
  el.addEventListener('click', async (event) => {
    event.preventDefault()
    for (var i = 0; i < letterButtons.length; i++) {
      letterButtons[i].classList.remove('active')
    }
    event.target.classList.add('active')
    const letter = event.target.dataset.letter
    const code = await fetch(`${APIURL}/wp-json/api/team?page=${1}&per_page=1&team_letter=${letter}`, { mode: 'cors', cache: 'reload' })
    const req = await code.json()
    const { data: { team, max_pages, found_posts } } = req
    buildList(team)
    buildPaginationLetter(max_pages, found_posts, 1)
  })
})

function buildPaginationLetter (max_pages, found_posts, active_page) {
  const pagination = document.querySelector('#pagination')
  let pages = ''
  for (var i = 0; i < max_pages; i++) {
    pages += `<button data-page="${i + 1}" class="${active_page === (i + 1) ? 'active': ''}">${i + 1}</button>`
  }
  pagination.innerHTML = pages
  const paginateButtons = document.querySelectorAll('#pagination button');

  [...paginateButtons].forEach(async (el, index) => {
    el.addEventListener('click', async (event) => {
      const page = +el.dataset.page
      for (var i = 0; i < paginateButtons.length; i++) {
        paginateButtons[i].classList.remove('active')
      }
      event.target.classList.add('active')
      const letter = document.querySelector('#alfabeto button.active').dataset.letter
      const code = await fetch(`${APIURL}/wp-json/api/team?page=${page}&per_page=1&team_letter=${letter}`, { mode: 'cors', cache: 'reload' })
      const req = await code.json()
      const { data: { team, max_pages, found_posts } } = req
      buildList(team)
    })
  })
}