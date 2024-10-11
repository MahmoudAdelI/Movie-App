import { createStore, combineReducers } from "./redux.js";

const user = (state, action) => {
    switch (action.type) {
        case 'ADD_USER':
            return  {
                        userId: action.payload.userId,
                        name: action.payload.name,
                        type: action.payload.type,
                        favorites: [],
                        watchlist: []
                    }; 
        case 'ADD_TO_FAVORITES':
            return state.userId === action.payload.userId ? 
                {
                    ...state,
                    favorites: [...state.favorites, {
                        id: action.payload.movieId
                    }]
                }
                : state;
        case 'ADD_TO_WATCHLIST':            
            return state.userId === action.payload.userId ? 
                {
                    ...state,
                    watchlist: [...state.watchlist, {
                        id: action.payload.movieId
                    }]
                }
                : state;

        default:
            return state;
    }
}
const usersReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD_USER':
            return [...state, user(undefined, action)];

        case 'ADD_TO_FAVORITES':        
            return state.map(u => user(u, action));
            
        case 'ADD_TO_WATCHLIST':           
            return state.map(u => user(u, action));
        default:
            return state;
    };
};

const movie = (state, action) => {
    switch (action.type) {
        case'ADD_MOVIE':            
                return {
                        id: action.payload.movieId,
                        title: action.payload.title,
                        img: action.payload.img,
                        details: action.payload.details,
                        ratings: [],
                        addedBy: action.payload.addedBy
                    };
                                              
        case 'RATE_MOVIE': 
                return state.id === action.payload.movieId ?        
                    {
                        ...state,
                        ratings: [...state.ratings, {
                            id: action.payload.ratedBy,
                            rating: action.payload.rating
                        }]
                    } 
                    : state;
                
        default:
            return state;
    }
}

const movieReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD_MOVIE':
                return [...state, movie(undefined, action)];                  

        case 'DELETE_MOVIE':   
                return state.filter( movie => movie.id !== action.payload.movieId );

        case 'RATE_MOVIE':
            return state.map(m => movie(m, action));
            
        default:
                return state;
    };
};

export const addUser = (userId, name, type) => {
    return store.dispatch({
        type: 'ADD_USER',
        payload: {userId, name, type}
    });
};

const getUser = id => store.getState().users.find(user => user.userId === id);

export const addMovie = (movieId, title, details, addedBy, img) => {
    const user = getUser(addedBy);
    return user.type === 'ADMIN' ? 
        store.dispatch({
        type: 'ADD_MOVIE',
        payload: {movieId, title, details, addedBy, img}
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
    if(movie) {
        return user && user.type === 'USER' ?
            store.dispatch({
            type: 'RATE_MOVIE',
            payload: {movieId, rating, ratedBy}
        }) : console.error('only users can rate movies');
    } else {console.error('movie not found')};
};

const getMovie = id => store.getState().movies.find(movie => movie.id === id);

export const addToFavorites = (userId, movieId) => {
    const movie = getMovie(movieId);
    return movie ?
        store.dispatch({
        type: 'ADD_TO_FAVORITES',
        payload: {userId, movieId}
    }) : console.error('movie not found');
};

export const addToWatchlist = (userId, movieId) => {
    const movie = getMovie(movieId);
    return movie ?
        store.dispatch({
        type: 'ADD_TO_WATCHLIST',
        payload: {userId, movieId}
    }) : console.error('movie not found');
};

export const getAllMovies = () => {
    return store.getState().movies;
};

export const whoRatedMovie = movieId => {
    const movie = getMovie(movieId);
    return movie ? movie.ratings.map(r => r.id) : 'movie not found';
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

const rootReducer = combineReducers({ users: usersReducer, movies: movieReducer });
export const store = createStore(rootReducer);

//adding users
addUser(10, 'mahmoud', 'ADMIN');
addUser(20, 'ahmed', 'USER');
addUser(30, 'yasser', 'USER');
addUser(40, 'karam', 'USER');

//adding movies
//addMovie(0, 'Taxi Driver', 'a movie about a deppresed taxi driver', 10, './imgs/taxi-driver.jpg');
addMovie(1, 'Inception', 'nobody actually knows what is going on', 10, './imgs/inception.jpg');
addMovie(2, 'The Godfather', 'it is about mafia and everone dies', 10, './imgs/the-godfather.jpg');

//deleting movies
//deleteMovie(1, 10);

//rating movies
// rateMovie(0, 8.5, 20);
// rateMovie(0, 9.7, 30);


//get all movies
console.log(getAllMovies());

//add to favorites
//addToFavorites(10, 0);

//add to watchlist
addToWatchlist(10, 1);

//get overall movie rate
store.subscribe(() => console.log(getOverAllRate(0)));;
//find who rated a movie
store.subscribe(() => console.log(whoRatedMovie(0)));

store.subscribe(() => {console.log(store.getState())});
