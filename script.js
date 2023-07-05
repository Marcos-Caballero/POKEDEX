const pokemonContainer = document.querySelector('.pokemon-container') /* Contenedor del pokemon */
const spinner = document.querySelector("#spinner"); /* Loader */
const previous = document.querySelector("#previous"); /* Pagina anterior */
const next = document.querySelector("#next"); /* Pagina siguiente */

let offset = 1;
let limit = 9;

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
    for (let i = offset; i < offset + limit; i++) {
        fetchPokemon(i)
    };
}

/* CARDS DE POKEMONS */

function createPokemon(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-block');
    
    const spriteContainer = document.createElement('div');
    spriteContainer.classList.add('img-container');

    const sprite = document.createElement('img');
    sprite.src = pokemon.sprites.front_default;

    spriteContainer.appendChild(sprite);

    const number = document.createElement('p');
    number.textContent = `#${pokemon.id.toString().padStart(3, 0)}`;

    const name = document.createElement('p');
    name.classList.add('name');
    name.textContent = pokemon.name

    card.appendChild(spriteContainer);
    card.appendChild(number);
    card.appendChild(name);

    pokemonContainer.appendChild(card);
}
function removeChildNodes(parent) {
    while(parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

fetchPokemons(offset, limit);