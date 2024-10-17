import { store, addUser, getAllMovies, getOverAllRate, addMovie, getMovie,
     addToWatched, updateWatched,toggleFavorites, toggleWatchlist, rateMovie} from "./index.js";

const login = document.querySelector('.login');
const movie = document.querySelector('.add-movie');
const movieTitle = document.querySelector('.title');
const movieDescription = document.querySelector('.description');
//const movieImage = document.querySelector('.image');
const movieDuration = document.querySelector('.duration');
const main = document.querySelector('main');
const formContainer = document.querySelector('.form-container');


login.addEventListener('submit', e => {
    e.preventDefault();
    const userId = String(Math.floor(Math.random() * 10000000000));
    const name = login.username.value.trim();
    const userType = e.submitter.value;
    addUser(userId, name, userType);
    login.style.display = 'none';
    formContainer.style.display = 'none'
});

movie.addEventListener('submit', e => {
    e.preventDefault();
    const users = store.getState().users;
    const userId = users[users.length - 1].userId;
    const movieId = String(Math.floor(Math.random() * 10000000000));
    const title = movieTitle.value.trim();
    const details = movieDescription.value.trim();
    //const img = movieImage.value.trim();
    const duration = Number(movieDuration.value.trim()) * 60;
    movie.reset();
    addMovie(movieId, title, details, userId, duration);
});

let time;
main.addEventListener('click', (e) => {
    const movieCard = e.target.closest('.movie-card');
    if (!movieCard) return;
    const users = store.getState().users;
    const userId = users[users.length - 1].userId;
    const movieId = movieCard.getAttribute('data-id'); // it returned as string

    if(e.target.classList.contains('play')) {
        time = new Date();
        console.log(`Started playing movie with ID: ${movieId}`);
        // ADD THE MOVIE TO WATCHED ARRAY IF NOT EXISTS
        addToWatched(userId, movieId, time);
        };
    
    if (e.target.classList.contains('pause')) {                   
            const endTime = new Date();
            const watchedTime = Math.floor(( endTime - time ) / 1000); // to seconds...
            console.log(`Paused movie with ID: ${movieId}, watched time: ${watchedTime}s`);
            // UPDATE THE MOVIES IN WATCHED ARRAY
            updateWatched(userId, movieId, watchedTime, endTime);
            time = null;
        };
    
    if (e.target.classList.contains('favorite')) {
        toggleFavorites(userId, movieId);
    };

    if (e.target.classList.contains('watchList')) {
        toggleWatchlist(userId, movieId);
    };

    if (e.target.classList.contains('fas')) {
        const stars = movieCard.querySelectorAll('.fa-star');
        stars.forEach(star => star.classList.remove('selected'))
        e.target.classList.add('selected');

        const rating = Number(e.target.getAttribute('data-rating'));
        console.log(rating);
        rateMovie(movieId, rating, userId);
    };
    
});


const render = () => {
    main.innerHTML = '';
    
    const users = store.getState().users;
    const user = users[users.length - 1];
    getAllMovies().forEach(movie => {
        const isFavorite = user.favorites.some(m => m.movieId === movie.movieId);
        const isInWatchlist = user.watchlist.some(m => m.movieId === movie.movieId);
        const overAllRate = getOverAllRate(movie.movieId);
        const isPlaying = user.watched.find(m => m.movieId === movie.movieId)?.isPlaying;
        const lastRating = getMovie(movie.movieId).ratings.find(r=> r.userId === user.userId)?.rating;
        console.log(lastRating);
        const html = `
        <div class="movie-card" data-id="${movie.movieId}">
            <div class="stars-container">
                <div class="stars">
                    <label class="fas fa-star ${lastRating===10?'selected':''}" data-rating="10"></label>
                    <label class="fas fa-star ${lastRating===9?'selected':''}" data-rating="9"></label>
                    <label class="fas fa-star ${lastRating===8?'selected':''}" data-rating="8"></label>
                    <label class="fas fa-star ${lastRating===7?'selected':''}" data-rating="7"></label>
                    <label class="fas fa-star ${lastRating===6?'selected':''}" data-rating="6"></label>
                    <label class="fas fa-star ${lastRating===5?'selected':''}" data-rating="5"></label>
                    <label class="fas fa-star ${lastRating===4?'selected':''}" data-rating="4"></label>
                    <label class="fas fa-star ${lastRating===3?'selected':''}" data-rating="3"></label>
                    <label class="fas fa-star ${lastRating===2?'selected':''}" data-rating="2"></label>
                    <label class="fas fa-star ${lastRating===1?'selected':''}" data-rating="1"></label>
                </div>
            </div>
            <img src="https://picsum.photos/200/300" alt="${movie.title}">
            <div class="playPause">           
                    <i class="fa-solid fa-play play ${!isPlaying? '' : 'hidden'}"></i>
                    <i class="fa-solid fa-pause pause ${isPlaying? '' : 'hidden'}"></i>
            </div>
            <div class="footer">
                <div class="title-rate">
                    <div class="title">${movie.title}</div>
                    <div class="rate">${overAllRate} ⭐</div>
                </div>
                <div class="icons">
                    <i class="fa-regular fa-heart favorite ${isFavorite? 'icon-clicked': ''}" ></i>
                    <i class="fa-regular fa-square-plus watchList ${isInWatchlist? 'icon-clicked': ''}"></i>
                </div>
            </div>
        </div>
        `;
        main.innerHTML += html;
    })
};
store.subscribe(() => render());
render();