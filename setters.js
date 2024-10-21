import { getMovie, getUser } from "./getters.js";
import { store } from "./state.js";

export const addUser = (userId, name, type) => {
    return store.dispatch({
        type: 'ADD_USER',
        payload: {userId, name, type}
    });
};

export const addMovie = (movieId, title, details, addedBy, duration) => {
    const user = getUser(addedBy);
    return user.type === 'ADMIN' ? 
        store.dispatch({
        type: 'ADD_MOVIE',
        payload: {movieId, title, details, addedBy, duration}
        }) : console.error('only admin can add movies');
};

export const deleteMovie = (movieId, deletedBy) => {
    const user = getUser(deletedBy);
    return user.type === 'ADMIN' ?
        store.dispatch({
        type: 'DELETE_MOVIE',
        payload: {movieId, deletedBy}
        }) : console.error('only admin can delete movies');
};

export const rateMovie = (movieId, rating, ratedBy) => {
    const movie = getMovie(movieId);
    const user = getUser(ratedBy);
    const isRated = movie.ratings.some(m => m.userId === ratedBy);
    if (isRated) { // if user added a new rating 
        return store.dispatch({
            type: 'UPDATE_RATINGS',
            payload: {movieId, rating, ratedBy}
        })
    };

    return user && user.type === 'USER' ? // if user hasn't rated before
            store.dispatch({
            type: 'RATE_MOVIE',
            payload: {movieId, rating, ratedBy}
        }) : console.error('only users can rate movies');

};

export const toggleFavorites = (userId, movieId) => {
    const user = getUser(userId);
    const movie = user.favorites.some(m => m.movieId === movieId);
    if(!movie) {
        return store.dispatch({
        type: 'ADD_TO_FAVORITES',
        payload: {userId, movieId} 
    })
    } else {
        console.error('movie already in the favorites')
        return store.dispatch({
        type: 'REMOVE_FROM_FAVORITES',
        payload: {userId, movieId}
    })
    }
};

export const toggleWatchlist = (userId, movieId) => {
    const user = getUser(userId);
    const movie = user.watchlist.some(m => m.movieId === movieId);
    if(!movie) {
        return store.dispatch({
            type: 'ADD_TO_WATCHLIST',
            payload: {userId, movieId}
        })
    } else {
        console.error('movie already in the watchlist')
        return store.dispatch({
            type: 'REMOVE_FROM_WATCHLIST',
            payload: {userId, movieId}
        })
    }
};

export const togglePlayPause = movieId => {
    store.dispatch({
        type: 'TOGGLE_PLAY_PAUSE',
        payload: {movieId}
    })
};
export const addToWatched = (userId, movieId, startTime) => {
    const user = getUser(userId);
    const movie = user.watched.find(m => m.movieId === movieId);
     if(!movie) {
        return store.dispatch({
        type: 'ADD_TO_WATCHED',
        payload: {movieId, startTime}
    })
    }; 
    if(!movie.isPlaying) { // to toggle the play btn
        console.log('isPlaying has been toggled');
        return togglePlayPause(movieId)
    }
};

export const updateWatched = (userId, movieId, endTime) => {
    const user = getUser(userId);
    const watchedMovie = user.watched.find(m => m.movieId === movieId);
    const movie = getMovie(movieId);
    if(watchedMovie) {
        // if completed is already set we retrive the first completed date, we don't need to refresh
        // its value with every pause
        const completed = watchedMovie.timer >= movie.duration ?
        watchedMovie.completed || `completed at ${endTime.toLocaleString()}` : false;
        // same logic here with finishedIn
        const finishedIn = completed ?
        watchedMovie.finishedIn || dateFns.intervalToDuration({start: watchedMovie.startTime, end: endTime}) : false;

        return store.dispatch({
            type: 'UPDATE_WATCHED',
            payload: {movieId, completed, finishedIn}
        })
        
    };

};




