document.addEventListener("DOMContentLoaded", initializeApp);

let allRecipes = [];
let lastModified = null;

function initializeApp() {
    startPolling();
    setupEventListeners();
}

function setupEventListeners() {
    const searchBar = document.querySelector('.search-bar input');
    if (searchBar) {
        searchBar.addEventListener('input', applyFilters);

        searchBar.addEventListener('keypress', function (event) {
            if (event.key === 'Enter' && this.value.trim() !== '') {
                event.preventDefault();
                const searchValue = this.value.trim();

                const existingTag = document.querySelector(`.selected-filter[data-type="search"][data-value="${searchValue}"]`);
                if (!existingTag) {
                    addSelectedFilter('search', searchValue);
                }

                this.value = '';
                applyFilters();
            }
        });
    }
}

async function startPolling() {
    await checkForUpdates();
    setInterval(checkForUpdates, 5000);
}

async function checkForUpdates() {
    try {
        const response = await fetch(recipeDataUrl, {
            method: 'HEAD'
        });

        const currentModified = response.headers.get('last-modified');

        if (lastModified === null || currentModified !== lastModified) {
            lastModified = currentModified;
            await getFilter();
        }
    } catch (error) {
        console.error("Erreur lors de la vérification des mises à jour :", error);
    }
}

async function getFilter() {
    try {
        const response = await fetch(recipeDataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (JSON.stringify(allRecipes) !== JSON.stringify(data)) {
            allRecipes = data;
            processFiltre(data);
            displayRecipes(data);
            console.log("Données mises à jour avec succès");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
    }
}

function displayRecipes(recipes) {
    const listRecipes = document.getElementById("recipeslist");
    const recipeCounter = document.getElementById("recipeCounter");
    listRecipes.innerHTML = '';
    recipeCounter.textContent = recipes.length;

    if (!document.getElementById('recipeModal')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="recipeModal" class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div id="modalContent"></div>
                </div>
            </div>
        `);

        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('recipeModal').style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('recipeModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    if (recipes.length === 0) {
        listRecipes.innerHTML = `
            <div class="no-results">
                <h2>Aucune recette ne correspond à votre recherche</h2>
                <p>Essayez avec d'autres critères de recherche</p>
            </div>`;
        return;
    }

    recipes.forEach(recipe => {
        listRecipes.innerHTML += `
            <article class="recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-image">
                    <img src="./images/JSON_recipes/${recipe.image}" alt="${recipe.name}">
                </div>
                <h2>${recipe.name}</h2>
            </article>`;
    });

    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', function () {
            const recipeId = this.getAttribute('data-recipe-id');
            const recipe = recipes.find(r => r.id === parseInt(recipeId));

            const ingredientsList = recipe.ingredients.map(ing => {
                let ingredientText = `${ing.ingredient}`;
                if (ing.quantity) {
                    ingredientText += `: ${ing.quantity}`;
                    if (ing.unit) ingredientText += ` ${ing.unit}`;
                }
                return `<li>${ingredientText}</li>`;
            }).join("");

            const ustensilsList = recipe.ustensils.map(ust => `<li>${ust}</li>`).join("");

            const modalContent = document.getElementById('modalContent');
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>${recipe.name}</h2>
                </div>
                <div class="modal-body">
                    <div class="recipe-image">
                        <img src="./images/JSON_recipes/${recipe.image}" alt="${recipe.name}">
                    </div>
                    <div class="recipe-details">
                        <div class="recipe-description">
                            <h3>Description</h3>
                            <p>${recipe.description}</p>
                        </div>
                        <div class="recipe-ingredients">
                            <h3>Ingrédients</h3>
                            <ul>${ingredientsList}</ul>
                        </div>
                        <div class="recipe-appliance">
                            <h3>Appareil</h3>
                            <p>${recipe.appliance}</p>
                        </div>
                        <div class="recipe-ustensils">
                            <h3>Ustensiles</h3>
                            <ul>${ustensilsList}</ul>
                        </div>
                    </div>
                </div>`;

            document.getElementById('recipeModal').style.display = 'block';
        });
    });
}

function updateVisibleFilters(filteredRecipes) {
    const visibleIngredients = new Set();
    const visibleAppliances = new Set();
    const visibleUstensils = new Set();

    filteredRecipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            visibleIngredients.add(ingredient.ingredient.toLowerCase());
        });

        if (recipe.appliance) {
            visibleAppliances.add(recipe.appliance.toLowerCase());
        }

        recipe.ustensils.forEach(ustensil => {
            visibleUstensils.add(ustensil.toLowerCase());
        });
    });

    updateFilterList("ingredients-list", visibleIngredients);
    updateFilterList("appliance-list", visibleAppliances);
    updateFilterList("ustensils-list", visibleUstensils);
}

function updateFilterList(listId, visibleFilters) {
    const listContainer = document.getElementById(listId);

    if (!listContainer) return;

    const items = listContainer.querySelectorAll('.checkbox-item');
    items.forEach(item => {
        const filterValue = item.querySelector('label').dataset.value.toLowerCase();
        if (visibleFilters.has(filterValue)) {
            item.style.display = ""; 
        } else {
            item.style.display = "none"; 
        }
    });
}

function applyFilters() {
    const searchInput = document.querySelector('.search-bar input');
    const selectedFilters = document.querySelectorAll('.selected-filter');

    const selectedIngredients = Array.from(selectedFilters)
        .filter(filter => filter.dataset.type === 'ingredient')
        .map(filter => filter.dataset.value.toLowerCase());

    const selectedAppliances = Array.from(selectedFilters)
        .filter(filter => filter.dataset.type === 'appliance')
        .map(filter => filter.dataset.value.toLowerCase());

    const selectedUstensils = Array.from(selectedFilters)
        .filter(filter => filter.dataset.type === 'ustensil')
        .map(filter => filter.dataset.value.toLowerCase());

    const searchTags = Array.from(selectedFilters)
        .filter(filter => filter.dataset.type === 'search')
        .map(filter => filter.dataset.value.toLowerCase());

    const currentSearch = searchInput.value.toLowerCase();

    const filteredRecipes = allRecipes.filter(recipe => {
        const matchesCurrentSearch =
            !currentSearch ||
            recipe.name.toLowerCase().includes(currentSearch) ||
            recipe.description.toLowerCase().includes(currentSearch) ||
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(currentSearch));

        const matchesSearchTags =
            searchTags.length === 0 ||
            searchTags.every(tag =>
                recipe.name.toLowerCase().includes(tag) ||
                recipe.description.toLowerCase().includes(tag) ||
                recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(tag))
            );

        const matchesIngredients =
            selectedIngredients.length === 0 ||
            selectedIngredients.every(selectedIng =>
                recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === selectedIng)
            );

        const matchesAppliances =
            selectedAppliances.length === 0 ||
            selectedAppliances.some(selectedApp => recipe.appliance.toLowerCase() === selectedApp);

        const matchesUstensils =
            selectedUstensils.length === 0 ||
            selectedUstensils.every(selectedUst =>
                recipe.ustensils.some(ust => ust.toLowerCase() === selectedUst)
            );

        return (
            matchesCurrentSearch &&
            matchesSearchTags &&
            matchesIngredients &&
            matchesAppliances &&
            matchesUstensils
        );
    });

    displayRecipes(filteredRecipes);

    updateVisibleFilters(filteredRecipes);
}


function filterCheckboxList(searchInput, listContainer) {
    const searchTerm = searchInput.value.toLowerCase();
    const checkboxItems = listContainer.querySelectorAll('.checkbox-item');

    checkboxItems.forEach(item => {
        const label = item.querySelector('label').textContent.toLowerCase();
        if (label.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function processFiltre(data) {
    const listFilter = document.getElementById("filterlist");
    const ingredients = new Set();
    const appliance = new Set();
    const ustensils = new Set();

    data.forEach(recipe => {
        recipe.ingredients.forEach(ing => {
            ingredients.add(ing.ingredient);
        });
        if (recipe.appliance) {
            appliance.add(recipe.appliance);
        }
        if (recipe.ustensils) {
            recipe.ustensils.forEach(ust => ustensils.add(ust));
        }
    });

    listFilter.innerHTML = `
        <div class="container-filter">
            <div class="filter-wrapper">
                <div class="filter-box collapsed">
                    <div class="filter-header">
                        <span class="filter-title">Ingrédients</span>
                        <div class="filter-content">
                            <input type="text" class="filter-search" id="search-ingredients" placeholder="Rechercher un ingrédient">
                            <div class="checkbox-list" id="ingredients-list">
                                ${Array.from(ingredients).sort().map(ing => `
                                    <div class="checkbox-item">
                                        <label class="filter-label" data-type="ingredient" data-value="${ing}">${ing}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="filter-box collapsed">
                    <div class="filter-header">
                        <span class="filter-title">Appareils</span>
                        <div class="filter-content">
                            <input type="text" class="filter-search" id="search-appliance" placeholder="Rechercher un appareil">
                            <div class="checkbox-list" id="appliance-list">
                                ${Array.from(appliance).sort().map(app => `
                                    <div class="checkbox-item">
                                        <label class="filter-label" data-type="appliance" data-value="${app}">${app}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="filter-box collapsed">
                    <div class="filter-header">
                        <span class="filter-title">Ustensiles</span>
                        <div class="filter-content">
                            <input type="text" class="filter-search" id="search-ustensils" placeholder="Rechercher un ustensile">
                            <div class="checkbox-list" id="ustensils-list">
                                ${Array.from(ustensils).sort().map(ust => `
                                    <div class="checkbox-item">
                                        <label class="filter-label" data-type="ustensil" data-value="${ust}">${ust}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="selected-filters"></div>

            <div class="recipe-count">
                <span id="recipeCounter">0</span> recettes
            </div>
        </div>`;

    document.querySelectorAll('.filter-box').forEach(box => {
        const title = box.querySelector('.filter-title');
        title.addEventListener('click', () => {
            document.querySelectorAll('.filter-box').forEach(otherBox => {
                if (otherBox !== box && !otherBox.classList.contains('collapsed')) {
                    otherBox.classList.add('collapsed');
                }
            });
            box.classList.toggle('collapsed');
        });
    });

    document.querySelectorAll('.filter-label').forEach(label => {
        label.addEventListener('click', function () {
            const type = this.dataset.type;
            const value = this.dataset.value;
            addSelectedFilter(type, value);
        });
    });

    document.querySelectorAll('.filter-search').forEach(input => {
        input.addEventListener('input', function () {
            const list = this.nextElementSibling;
            filterCheckboxList(this, list);
        });
    });
}

function addSelectedFilter(type, value) {
    const selectedFilters = document.querySelector('.selected-filters');
    const existingFilter = document.querySelector(`.selected-filter[data-type="${type}"][data-value="${value}"]`);

    if (!existingFilter) {
        const filterElement = document.createElement('div');
        filterElement.className = 'selected-filter';
        filterElement.dataset.type = type;
        filterElement.dataset.value = value;
        filterElement.innerHTML = `
            ${value}
            <span class="remove-filter">&times;</span>
        `;

        filterElement.querySelector('.remove-filter').addEventListener('click', function (e) {
            e.stopPropagation();
            filterElement.remove();
            applyFilters();
        });

        selectedFilters.appendChild(filterElement);
        applyFilters();
    }
}