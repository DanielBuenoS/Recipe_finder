function startApp() {

    const selectCategories = document.querySelector('#categories');
    const result = document.querySelector('#result');
    const modal = new bootstrap.Modal('#modal', {});

    if(selectCategories) {
        selectCategories.addEventListener('change', selectCategory);
        getCategories();
    }
    
    const favoritesDiv = document.querySelector('.favorites');
    if(favoritesDiv) {
        getFavorites();
    }


    function getCategories() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then(response => response.json())
            .then(jsonResponse => showCategories(jsonResponse.categories))    
    }

    function showCategories(categories = []) {
        categories.forEach(category => {
            const {strCategory} = category;
            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;

            selectCategories.appendChild(option);
        });
    }

    function selectCategory(evt) {
        
        const category = evt.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
        
        fetch(url)
            .then(response => response.json())
            .then(jsonResponse => showRecipes(jsonResponse.meals))

    }

    function showRecipes(recipes = []) {
        
        cleanHTML(result);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recipes.length ? 'Results' : 'No Results';
        result.appendChild(heading);

        // Iteration on results
        recipes.forEach(recipe => {
        
            const {idMeal, strMeal, strMealThumb} = recipe;

            const recipeContainer = document.createElement('DIV');
            recipeContainer.classList.add('col-md-4');

            const recipeCard = document.createElement('DIV');
            recipeCard.classList.add('card', 'mb-4');

            const recipeImage = document.createElement('IMG');
            recipeImage.classList.add('card-img-top');
            recipeImage.alt = `Recipe Image ${strMeal ?? recipe.title}`;
            recipeImage.src = strMealThumb ?? recipe.img;

            const recipeCardBody = document.createElement('DIV');
            recipeCardBody.classList.add('card-body');

            const recipeCardHeading = document.createElement('H3');
            recipeCardHeading.classList.add('card-title', 'mb-3');
            recipeCardHeading.textContent = strMeal ?? recipe.title;

            const recipeButton = document.createElement('BUTTON');
            recipeButton.classList.add('btn', 'btn-danger', 'w-100');
            recipeButton.textContent = 'See recipe';
            
            recipeButton.onclick = () => selectRecipe(idMeal ?? recipe.id);

            // Rendering in DOM

            recipeCardBody.appendChild(recipeCardHeading);
            recipeCardBody.appendChild(recipeButton);

            recipeCard.appendChild(recipeImage);
            recipeCard.appendChild(recipeCardBody);

            recipeContainer.appendChild(recipeCard);

            result.appendChild(recipeContainer);

        });
    }

    function selectRecipe(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(response => response.json())
            .then(jsonResponse => {
                showRecipeModal(jsonResponse.meals[0]);
            });
    }

    function showRecipeModal(recipe) {
        
        const {idMeal, strInstructions, strMeal, strMealThumb} = recipe;

        // Add content to modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');
        
        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="recipe ${strMeal}" />
            <h3 class="my-3">Instructions</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredients & Measures</h3>
        `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        // Show ingredients and measures
        for(let i = 1; i<=20; i++) {
            if(recipe[`strIngredient${i}`]) {
                const ingredient = recipe[`strIngredient${i}`];
                const measure = recipe[`strMeasure${i}`];

                const ingredientLi = document.createElement('LI');
                ingredientLi.classList.add('list-group-item');
                ingredientLi.textContent = `${ingredient} - ${measure}`;

                listGroup.appendChild(ingredientLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        limpiarHTML(modalFooter);

        // Close and Favorite buttons
        const btnFavorite = document.createElement('BUTTON');
        btnFavorite.classList.add('btn', 'btn-danger', 'col');
        btnFavorite.textContent = existeStorage(idMeal) ? 'Remove Favorite' : 'Save Favorite';

        // LocalStorage

        btnFavorite.onclick = () => {

            if(existStorage(idMeal)) {
                deleteFavorite(idMeal);
                btnFavorite.textContent = 'Save Favorite';
                showToast('Favorite Removed Successfully');
                return;
            }

            addFavorite({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            });

            showToast('Favorite Saved Successfully');
            btnFavorite.textContent = 'Remove Favorite'
        }

        const btnCloseModal = document.createElement('BUTTON');
        btnCloseModal.classList.add('btn', 'btn-secondary', 'col');
        btnCloseModal.textContent = 'Close';
        btnCloseModal.onclick = () => {
            modal.hide();
        } 
        
        modalFooter.appendChild(btnFavorite);
        modalFooter.appendChild(btnCloseModal);

        // Show modal
        modal.show();
    }

    function addFavorite(recipe) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        localStorage.setItem('favorites', JSON.stringify([...favorites, recipe]));
    }

    function deleteFavorite(id) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        const newFavorites = favorites.filter(favorite => favorite.id !== id);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        if(favoritesDiv) {
            setTimeout(() => {
                window.location.href = 'favorites.html';
            }, 2000);
        }
    }

    function existStorage(id) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        return favorites.some(favorite => favorite.id === id);
    }

    function showToast(message) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = message;
        
        toast.show();

        setTimeout(() => {
            toast.hide();
        }, 3000);
    }

    function getFavorites(params) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        if(favorites.length) {
            showRecipes(favorites);
            return;
        }

        const noFavorites = document.createElement('P');
        noFavorites.textContent = 'No favorites yet';
        noFavorites.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        favoritesDiv.appendChild(noFavorites);
    }

    function cleanHTML(selector) {
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', startApp);