import { store } from "./state.js";

export const getUser = userId => store.getState().present.users.find(user => user.userId === userId);

export const getMovie = movieId => store.getState().present.movies.find(movie => movie.movieId === movieId);

export const getAllMovies = () => {
    return store.getState().present.movies;
};

export const getWatchedTime = (userId, movieId) => {
    const user = getUser(userId);
    const movie = user.watched.find(m => m.movieId === movieId);
    return movie ?
    movie.watchedTime : console.error('movie not found');
};

export const getUserRatedMovies = userId => {
    return store.getState().present.movies.filter(m => m.ratings.some(r => r.userId === userId))
};

export const getUsersWhoWatchedMovie = movieId => { 
    return store.getState().present.users.filter(u => u.watched.some(m => m.movieId === movieId))
};

export const getUsersWhoRatedMovie = movieId => {
    const movie = getMovie(movieId);
    return movie ? movie.ratings.map(r => r.userId) : 'movie not found';
};

export const getOverAllRate = movieId => {
    const movie = getMovie(movieId);
    if(movie && movie.ratings.length > 0) { 
        const ratings = movie.ratings.map(r => r.rating);
        const ratingsSum = ratings.reduce((acc, current)=> acc + current, 0);
        return Math.round(ratingsSum / ratings.length) + '/10';
    } else {
        return 0 + '/10'
    };
};