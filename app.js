import { store, getAllMovies, getOverAllRate, addMovie, rateMovie } from "./index.js";

const movie = document.querySelector('.add-movie');
const movieTitle = document.querySelector('.title');
const movieDescription = document.querySelector('.description');
const movieImage = document.querySelector('.image');
const main = document.querySelector('main');

movie.addEventListener('submit', e => {
    e.preventDefault();
    const movieId = Math.floor(Math.random() * 10000000000);;
    const title = movieTitle.value.trim();
    const details = movieDescription.value.trim();
    const img = movieImage.value.trim();
    addMovie(movieId, title, details, 10, img);
    // rateMovie(0, 8.5, 20);
    // rateMovie(0, 9.7, 30);
    // rateMovie(0, 0, 40);
})
const render = () => {
    main.innerHTML = '';
    getAllMovies().forEach(movie => {
        const overAllRate = getOverAllRate(movie.id);
        const html = `
        <div class="movie-card">
            <img src="${movie.img}" alt="${movie.title}">
            <div class="footer">
                <div class="title">${movie.title}</div>
                <div class="rate">${overAllRate} ⭐</div>
            </div>
        </div>
        `;
        main.innerHTML += html;
    })
};
store.subscribe(() => render());
render();