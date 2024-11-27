const recipeDataUrl = "https://gist.githubusercontent.com/baiello/0a974b9c1ec73d7d0ed7c8abc361fc8e/raw/e598efa6ef42d34cc8d7e35da5afab795941e53e/recipes.json";

document.addEventListener("DOMContentLoaded", getRecipes);

async function getRecipes() {
    try {
        let response = await fetch(recipeDataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();
        processData(data);
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
    }
}

function processData(data) {
    const listRecipes = document.getElementById("recipeslist");

    data.forEach(recipe => {
        const ingredientsList = recipe.ingredients.map(ing => {
            let ingredientText = `${ing.ingredient}`;
            if (ing.quantity) {
                ingredientText += `: ${ing.quantity}`;
                if (ing.unit) ingredientText += ` ${ing.unit}`;
            }
            return `<li>${ingredientText}</li>`;
        }).join("");

        const ustensilsList = recipe.ustensils.map(ust => `<li>${ust}</li>`).join("");

        listRecipes.innerHTML += `
            <article class="recettes">
                <div>
                    <img src="./images/JSON_recipes/${recipe.image}" alt="${recipe.name}">
                </div>
                <div>
                    <h2>${recipe.name}</h2>
                    <div>
                        <h3>Recette</h3>
                        <p>${recipe.description}</p>
                    </div>
                    <div>
                        <h3>Ingrédients</h3>
                        <ul>
                            ${ingredientsList}
                        </ul>
                    </div>
                    <div>
                        <h3>Appareil</h3>
                        <p>${recipe.appliance}</p>
                    </div>
                    <div>
                        <h3>Ustensiles</h3>
                        <ul>
                            ${ustensilsList}
                        </ul>
                    </div>
                </div>
            </article>`;
    });
}

