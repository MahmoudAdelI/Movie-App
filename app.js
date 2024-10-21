import { getAllMovies, getMovie, getOverAllRate, getUser } from "./getters.js";
import { addMovie, addToWatched, addUser, deleteMovie, rateMovie, toggleFavorites, togglePlayPause, toggleWatchlist, updateWatched } from "./setters.js";
import { store } from "./state.js";


const register = document.querySelector('.register-form');
const login = document.querySelector('.login-form');
const registerFormContainer = document.querySelector('.register-form-container');
const loginFormContainer = document.querySelector('.login-form-container');
const movie = document.querySelector('.add-movie');
const movieTitle = document.querySelector('.title');
const movieDescription = document.querySelector('.description');
const movieDuration = document.querySelector('.duration');
const main = document.querySelector('main');
const undo = document.querySelector('.undo');

let mainUser;
if(JSON.parse(localStorage.getItem('user'))) {
    mainUser = JSON.parse(localStorage.getItem('user'))
}

const registerBtn = document.querySelector('.register');
const loginBtn = document.querySelector('.login');
const logoutBtn = document.querySelector('.logout');

function updatAuthButtons() {
    if(mainUser) {
        loginFormContainer.classList.add('hidden');
        checkAdminPermissions();
        loginBtn.classList.add('hidden'); 
        registerBtn.classList.add('hidden'); 
        logoutBtn.classList.remove('hidden'); 
    } else {
        loginBtn.classList.remove('hidden'); 
        registerBtn.classList.remove('hidden'); 
        logoutBtn.classList.add('hidden'); 
    }
}
// Call this function to update buttons on page load
updatAuthButtons();

registerBtn.addEventListener('click', () => {
    registerFormContainer.classList.remove('hidden')
})
register.addEventListener('submit', e => {
    e.preventDefault();
    const userId = String(Math.floor(Math.random() * 10000000000));
    const name = register.username.value.trim();
    const userType = e.submitter.value;
    addUser(userId, name, userType);
    register.reset();
    registerFormContainer.classList.add('hidden')
    loginFormContainer.classList.remove('hidden');
});
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    mainUser = null;
    location.reload()
})

loginBtn.addEventListener('click', () => {
    if (!registerFormContainer.classList.contains('hidden')) {
        registerFormContainer.classList.add('hidden')
    }
    loginFormContainer.classList.remove('hidden');
    
})
login.addEventListener('submit', e => {
    e.preventDefault();
    const username = login.username.value.trim();
    const user = store.getState().present.users.find(u => u.name === username);
    if (user){
        localStorage.setItem('user', JSON.stringify(user));
        mainUser = user;
        loginFormContainer.classList.add('hidden');
        checkAdminPermissions()
        updatAuthButtons();   
        location.reload()     
    } else {
        console.error('user not found please rgister');
        registerFormContainer.classList.remove('hidden')
    }
    login.reset();

})
function checkAdminPermissions() {
    if (mainUser.type === 'ADMIN') {
        movie.classList.remove('hidden');  // Show movie form if user is an admin
    } else {
        movie.classList.add('hidden');  // Hide movie form for non-admin users
    }
}
movie.addEventListener('submit', e => {
    e.preventDefault();
    const userId = mainUser.userId;
    const movieId = String(Math.floor(Math.random() * 10000000000));
    const title = movieTitle.value.trim();
    const details = movieDescription.value.trim();
    const duration = Number(movieDuration.value.trim()) * 60;
    movie.reset();
    addMovie(movieId, title, details, userId, duration);
});

undo.addEventListener('click', () => {
    store.dispatch({
        type: 'UNDO'
    })
    undo.classList.add('hidden')
})


let startTime;
main.addEventListener('click', (e) => {
    const movieCard = e.target.closest('.movie-card');
    if (!movieCard) return;
    const userId = mainUser.userId;
    const movieId = movieCard.getAttribute('data-id'); // it returned as string
    if(e.target.classList.contains('play')) {
        startTime = new Date();
        console.log(`Started playing movie with ID: ${movieId}`);
        // ADD THE MOVIE TO WATCHED ARRAY IF NOT EXISTS
        addToWatched(userId, movieId, startTime);
        
        const time = setInterval(() => {
            const isPlaying = mainUser.watched.find(m=>m.movieId===movieId).isPlaying;
            const timer = mainUser.watched.find(m=>m.movieId===movieId).timer;
            const endTime = new Date();
            if(
                !isPlaying || timer >= getMovie(movieId).duration
            ) {
                if (isPlaying) {
                    togglePlayPause(movieId);  // Toggle once, when timer stops.
                }
                clearInterval(time);
                updateWatched(userId, movieId, endTime);
            } else {
                store.dispatch({
                    type: 'UPDATE_TIMER',
                    payload: {movieId}
                })
            }
        }, 1000);
        };
    
    if (e.target.classList.contains('pause')) {                   
            const endTime = new Date();
            console.log(`Paused movie with ID: ${movieId}, watched time: ${watchedTime}s`);
            // UPDATE THE MOVIES IN WATCHED ARRAY
            togglePlayPause(movieId);
            updateWatched(userId, movieId, watchedTime, endTime);
            startTime = null;
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
        rateMovie(movieId, rating, userId);
    };

    if(e.target.classList.contains('delete') || e.target.closest('.delete')) {
        deleteMovie(movieId, userId);
        if(store.getState().past.length > 0){
            undo.classList.remove('hidden')
            setTimeout(() => undo.classList.add('hidden'), 6000)
        }
    }
    
});

function formatTimeWithDateFns(seconds) {
    const baseDate = new Date(0); // Base date: Jan 1, 1970
    const resultDate = dateFns.addSeconds(baseDate, seconds);

    if (seconds >= 3600) {
        // Format with hours, minutes, and seconds (HH:mm:ss)
        return dateFns.format(resultDate, 'H:mm:ss');
    } else {
        // Format with minutes and seconds (mm:ss)
        return dateFns.format(resultDate, 'm:ss');
    }
}

const render = () => {
    if(mainUser){
        mainUser = getUser(mainUser.userId);
        localStorage.setItem('user', JSON.stringify(mainUser));
    }

    main.innerHTML = '';
    
    getAllMovies().forEach(movie => {
        const isFavorite = mainUser?.favorites.some(m => m.movieId === movie.movieId);
        const isInWatchlist = mainUser?.watchlist.some(m => m.movieId === movie.movieId);
        const overAllRate = getOverAllRate(movie.movieId);
        const isPlaying = mainUser?.watched.find(m => m.movieId === movie.movieId)?.isPlaying;
        const lastRating = getMovie(movie.movieId).ratings.find(r=> r.userId === mainUser?.userId)?.rating;
        const timer = mainUser?.watched.find(m => m.movieId === movie.movieId)?.timer;
        const duration = getMovie(movie.movieId).duration;
        const isAdmin = mainUser?.type === 'ADMIN';
        console.log(`test ${isAdmin}`);
        const html = `
        <div class="movie-card" data-id="${movie.movieId}">
            <div class="delete ${isAdmin? '':'hidden'}">
                <i class="fa-solid fa-trash"></i>
            </div>
            <div class="stars-container ${isAdmin? 'hidden':''}">
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
            <div class="playPause ${!isAdmin? '':'hidden'}">           
                    <i class="fa-solid fa-play play ${!isPlaying? '' : 'hidden'}"></i>
                    <i class="fa-solid fa-pause pause ${isPlaying? '' : 'hidden'}"></i>
            </div>
            <div class="timer">
               ${formatTimeWithDateFns(duration)}  ${timer?`/${formatTimeWithDateFns(timer)}`:''}
            </div>
            <div class="footer">
                <div class="title-rate">
                    <div class="title">${movie.title}</div>
                    <div class="rate">${overAllRate} ⭐</div>
                </div>
                <div class="icons ${!isAdmin? '':'hidden'}">
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