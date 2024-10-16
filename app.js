import { store, addUser, getAllMovies, getOverAllRate, addMovie,
     addToWatched, updateWatched,toggleFavorites, toggleWatchlist,
     rateMovie} from "./index.js";

const login = document.querySelector('.login');
const movie = document.querySelector('.add-movie');
const movieTitle = document.querySelector('.title');
const movieDescription = document.querySelector('.description');
//const movieImage = document.querySelector('.image');
const movieDuration = document.querySelector('.duration');
const main = document.querySelector('main');
const formContainer = document.querySelector('.form-container');


const stars = document.querySelectorAll(".stars i");
// Loop through the "stars" NodeList
stars.forEach((star, index1) => {
  // Add an event listener that runs a function when the "click" event is triggered
  star.addEventListener("click", () => {
    // Loop through the "stars" NodeList Again
    stars.forEach((star, index2) => {
      // Add the "active" class to the clicked star and any stars with a lower index
      // and remove the "active" class from any stars with a higher index
      index1 >= index2 ? star.classList.add("active") : star.classList.remove("active");
    });
  });
});

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
        const playBtn = e.target;
        const pauseBtn = movieCard.querySelector('.pause');
        playBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        // ADD THE MOVIE TO WATCHED ARRAY IF NOT EXISTS
        addToWatched(userId, movieId, time);
        };
    
    if (e.target.classList.contains('pause')) {                   
            const endTime = new Date();
            const watchedTime = Math.floor(( endTime - time ) / 1000); // to seconds...
            console.log(`Paused movie with ID: ${movieId}, watched time: ${watchedTime}s`);
            const pauseBtn = e.target;
            const playBtn = movieCard.querySelector('.play');
            pauseBtn.classList.add('hidden');
            playBtn.classList.remove('hidden');
            // UPDATE THE MOVIES IN WATCHED ARRAY
            updateWatched(userId, movieId, watchedTime, endTime);
            time = null;
        };
    
    if (e.target.classList.contains('favorite')) {
        toggleFavorites(userId, movieId);
        // e.target.classList.add('icon-clicked');
    }
    if (e.target.classList.contains('watchList')) {
        toggleWatchlist(userId, movieId);
        e.target.classList.add('icon-clicked');
    }
    if (e.target.classList.contains('fas')) {
        const rating = e.target.getAttribute('data-rating');
        console.log(userId);
        console.log(movieId);
        console.log(rating);
        rateMovie(movieId, rating, userId);
    }
    
});


const render = () => {
    main.innerHTML = '';
    
    getAllMovies().forEach(movie => {
        const users = store.getState().users;
        const user = users[users.length - 1];
        const isFavorite = user.favorites.some(m => m.movieId === movie.movieId);
        const isInWatchlist = user.watchlist.some(m => m.movieId === movie.movieId);
        const overAllRate = getOverAllRate(movie.movieId);
        const html = `
        <div class="movie-card" data-id="${movie.movieId}">
            <div class="stars-container">
                <div class="stars">
                    <input type="radio" name="rate" class="fa-solid fa-star" id="${movie.movieId}-rate-10"></input>
                    <label for="${movie.movieId}-rate-10" class="fas fa-star" data-rating="10"></label>
                    <input type="radio" name="rate" class="fa-solid fa-star" id="${movie.movieId}-rate-9"></input>
                    <label for="${movie.movieId}-rate-9" class="fas fa-star" data-rating="9"></label>
                    <input type="radio" name="rate" class="fa-solid fa-star" id="${movie.movieId}-rate-8"></input>
                    <label for="${movie.movieId}-rate-8" class="fas fa-star" data-rating="8"></label>
                    <input type="radio" name="rate" class="fa-solid fa-star" id="${movie.movieId}-rate-7"></input>
                    <label for="${movie.movieId}-rate-7" class="fas fa-star" data-rating="7"</label>
                    <input type="radio" name="rate" class="fa-solid fa-star" id="${movie.movieId}-rate-6"></input>
                    <label for="${movie.movieId}-rate-6" class="fas fa-star" data-rating="6"></label>
                    <input type="radio" name="rate" class="fa-solid fa-star" id="${movie.movieId}-rate-5"></input>
                    <label for="${movie.movieId}-rate-5" class="fas fa-star" data-rating="5"></label>
                    <input type="radio" name="rate" class="fa-solid fa-star" id="${movie.movieId}-rate-4"></input>
                    <label for="${movie.movieId}-rate-4" class="fas fa-star" data-rating="4"></label>
                    <input type="radio" name="rate" class="fa-solid fa-star" id="${movie.movieId}-rate-3"></input>
                    <label for="${movie.movieId}-rate-3" class="fas fa-star" data-rating="3"></label>
                    <input type="radio" name="rate" class="fa-solid fa-star" id="${movie.movieId}-rate-2"></input>
                    <label for="${movie.movieId}-rate-2" class="fas fa-star" data-rating="2"></label>
                    <input type="radio" name="rate" class="fa-solid fa-star" id="${movie.movieId}-rate-1"></input>
                    <label for="${movie.movieId}-rate-1" class="fas fa-star" data-rating="1"></label>
                </div>
            </div>
            <img src="https://picsum.photos/200/300" alt="${movie.title}">
            <div class="playPause">           
                    <i class="fa-solid fa-play play"></i>
                    <i class="fa-solid fa-pause pause hidden"></i>
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