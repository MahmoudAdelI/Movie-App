import { store, addUser, getAllMovies, getOverAllRate, addMovie, rateMovie, whoWatchedMovie, addToWatched, updateWatched } from "./index.js";

const login = document.querySelector('.login');
const movie = document.querySelector('.add-movie');
const movieTitle = document.querySelector('.title');
const movieDescription = document.querySelector('.description');
const movieImage = document.querySelector('.image');
const main = document.querySelector('main');



login.addEventListener('submit', e => {
    e.preventDefault();
    const userId = String(Math.floor(Math.random() * 10000000000));
    const name = login.username.value.trim();
    const userType = e.submitter.value;
    addUser(userId, name, userType);
    login.style.display = 'none';
});

movie.addEventListener('submit', e => {
    e.preventDefault();
    const userId = store.getState().users[0].userId;
    const movieId = String(Math.floor(Math.random() * 10000000000));
    const title = movieTitle.value.trim();
    const details = movieDescription.value.trim();
    const img = movieImage.value.trim();
    addMovie(movieId, title, details, userId, img);
});

let time;
main.addEventListener('click', (e) => {
    const userId = store.getState().users[0].userId;
    const movieId = e.target.getAttribute('data-id'); // because it returned as string

    if(e.target.classList.contains('play')) {
        time = new Date();
        console.log(`Started playing movie with ID: ${e.target.getAttribute('data-id')}`);
        // ADD THE MOVIE TO WATCHED ARRAY IF NOT EXISTS
        addToWatched(userId, movieId, time);
        };
    
    if (e.target.classList.contains('pause')) {                   
            const endTime = new Date();
            const watchedTime = dateFns.differenceInSeconds(endTime , time); // to seconds...
            // UPDATE THE MOVIES IN WATCHED ARRAY
            updateWatched(userId, movieId, watchedTime);
            console.log(`Paused movie with ID: ${movieId}, watched time: ${watchedTime}s`);
            time = null;
        };
    });


const render = () => {
    main.innerHTML = '';
    getAllMovies().forEach(movie => {
        const overAllRate = getOverAllRate(movie.movieId);
        const html = `
        <div class="movie-card">
        <img src="${movie.img}" alt="${movie.title}">
        <div class="playPause">
            <button class="play" data-id="${movie.movieId}">Play</button>
            <button class="pause" data-id="${movie.movieId}">Pause</button>
        </div>
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