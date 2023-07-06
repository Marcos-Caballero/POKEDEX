const pokemonContainer = document.querySelector('.pokemon-container') /* Contenedor del pokemon */
const spinner = document.querySelector("#spinner"); /* Loader */
const previous = document.querySelector("#previous"); /* Pagina anterior */
const next = document.querySelector("#next"); /* Pagina siguiente */
const searchInput = document.getElementById('searchInput'); /* Barra de busqueda */

let offset = 1;
let limit = 9;
let allPokemons = []; // Array para almacenar todos los pokémones de la API

/* Boton de retroceder */
previous.addEventListener("click", () => {
    if (offset != 1) {
        offset -=9;
        removeChildNodes(pokemonContainer);
        fetchPokemons(offset, limit);
    }
});

/* Boton de avanzar */
next.addEventListener("click", () => {
    offset +=9;
    removeChildNodes(pokemonContainer);
    fetchPokemons(offset, limit);
});

/* ENLACE DE JS CON LA API */

function fetchPokemon(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
    .then(response => response.json())
    .then(data => {
        createPokemon(data);
        spinner.style.display = "none";
    });
}
function fetchPokemons(offset, limit) {
    spinner.style.display = "block";
    fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(pokemon => {
                const pokemonId = getPokemonIdFromUrl(pokemon.url);
                fetchPokemon(pokemonId);
            });
            spinner.style.display = "none";
        })
        .catch(error => {
            console.log('Error al cargar los pokémones:', error);
            spinner.style.display = "none";
        });
}

fetchAllPokemons();
fetchPokemons(offset, limit);   

/* CARDS DE POKEMONS */

function createPokemon(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-block');
    
    const spriteContainer = document.createElement('div');
    spriteContainer.classList.add('img-container');
    /* sprite (imagen) */
    const sprite = document.createElement('img');
    sprite.src = pokemon.sprites.front_default;
    
    spriteContainer.appendChild(sprite);
    /* numero */
    const number = document.createElement('p');
    number.classList.add('number');
    number.textContent = `#${pokemon.id.toString().padStart(3, 0)}`;
    /* nombre */
    const name = document.createElement('p');
    name.classList.add('name');
    name.textContent = pokemon.name;
    /* tipo */
    const types = pokemon.types.map(type => type.type.name).join(' - ');
    
    const type = document.createElement('p');
    type.classList.add('type');
    type.textContent = `${types}`;
    
    card.appendChild(spriteContainer);
    card.appendChild(number);
    card.appendChild(name);
    card.appendChild(type);
    
    pokemonContainer.appendChild(card);
    
    /* modal de informacion  */
    card.addEventListener("click", () => {
        openModal(pokemon);
    });
}

/* Función de quitar las tarjeticas anteriores */
function removeChildNodes(parent) {
    while(parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }   
}

/* Funcion para mostrar el modal */

function openModal(pokemon) {
    const modalTitle = document.getElementById('pokemonModalTitle');
    const modalSprite = document.getElementById('pokemonModalSprite');
    const modalInfo = document.getElementById('pokemonModalInfo');
    
    modalTitle.textContent = `Información de ${pokemon.name}`;
    
    // Mostrar el sprite
    const spriteContainer = document.createElement('div');
    spriteContainer.classList.add('modal-sprite-container');

    const spriteFront = document.createElement('img');
    spriteFront.src = pokemon.sprites.front_default;
    spriteFront.alt = `${pokemon.name} - Front`;

    const spriteBack = document.createElement('img');
    spriteBack.src = pokemon.sprites.back_default;
    spriteBack.alt = `${pokemon.name} - Back`;

    spriteContainer.appendChild(spriteFront);
    spriteContainer.appendChild(spriteBack);

    modalSprite.innerHTML = '';
    modalSprite.appendChild(spriteContainer);
    // Información detallada del pokemon
    const info = document.createElement('div');
    const stats = pokemon.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join('<br>');

    const number = document.createElement('p');
    number.textContent = `Número: ${pokemon.id.toString().padStart(3, 0)}`;
    
    info.innerHTML = `
    <h3>Datos</h3>
    <p>${number.textContent}</p>
    <p>Peso: ${pokemon.weight}</p>
    <p>Altura: ${pokemon.height}</p>
    <p>Tipo: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
    <h3>Estadísticas</h3>
    <p>${stats}</p>
    `;
    modalInfo.innerHTML = '';
    modalInfo.appendChild(info);
    
    const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
    modal.show();
}

/* Barra de busqueda */

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        // Si el campo de búsqueda está vacío, cargar los pokémones de la página actual
        offset = 1;
        removeChildNodes(pokemonContainer);
        fetchPokemons(offset, limit);
    } else {
        // Realizar una nueva búsqueda en toda la API
        spinner.style.display = 'block';
        removeChildNodes(pokemonContainer);
        filterAndShowPokemons(searchTerm);
    }
});

function fetchAllPokemons() {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
        .then(response => response.json())
        .then(data => {
            allPokemons = data.results;
        })
        .catch(error => {
            console.log('Error al obtener los pokémones:', error);
        });
}

function filterAndShowPokemons(searchTerm) {
    const filteredPokemons = allPokemons.filter(pokemon => pokemon.name.includes(searchTerm));

    if (filteredPokemons.length === 0) {
        // Mostrar mensaje de no coincidencias
        const message = document.createElement('p');
        message.textContent = 'No se encontraron resultados.';
        message.classList.add('no-results-message');
        pokemonContainer.appendChild(message);
        spinner.style.display = 'none';
    } else {
        const slicedPokemons = filteredPokemons.slice(0, limit);
        const promises = slicedPokemons.map(pokemon => {
            const pokemonId = getPokemonIdFromUrl(pokemon.url);
            return fetchPokemon(pokemonId);
        });

        spinner.style.display = 'block';
        Promise.all(promises)
            .then(() => {
                spinner.style.display = 'none';
            })
            .catch(error => {
                console.log('Error en la búsqueda:', error);
                spinner.style.display = 'none';
            });
    }
}


function getPokemonIdFromUrl(url) {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 2]);
}
