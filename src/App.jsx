/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import './App.css'
import StarRating from './StarRating'

const key = '4dc7f318';

function App() {

  const [movies,setMovies] = useState([]);
  // const [watched,setWatched]=useState([]);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("")
  const [query,setQuery] = useState("");
  const [movieId,setmovieId]=useState(null)
  
  const [watched,setWatched]=useState(function(){  // we can pass callback functions in useState and they must be pure functions
    const storedValue=localStorage.getItem("watched")
    return JSON.parse(storedValue);
  }) // This is called lazy evaluation

  function handleClick(id){
    setmovieId(id)
  }

  function handleClose()
  {
    setmovieId(null)
  }

  function handleAddWatched(movie)
  {
    const isAlreadyWatched = watched.some((m) => m.imdbID === movie.imdbID);
  if (isAlreadyWatched) 
    {
      setmovieId(null)
      return;
    }
  setWatched((watched)=>[...watched,movie])
  setmovieId(null)
  }
  
  function handleRemove(id){
    setWatched((movies)=>
    movies.filter((movie)=>
    movie.imdbID!=id))
  }

  useEffect(function(){

    const controller =  new AbortController() // browser api
    async function fetchMovies(){
      try{
        setLoading(true);
        setErr("")
        const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&s=${query}`,{signal:controller.signal}); // remember signal code

        if(!res.ok)
          throw new Error("Something went wrong with fetching movies!")
 
        const data = await res.json();

        if(data.Response=='False')
          {
            setMovies([])
            setErr("Movie not found")
            return;
          }
        setMovies(data.Search);
        setErr("")
      }
    catch(err){
      if(err.name!=="AbortError")
      setErr(err.message);
    } 
    finally{
      setLoading(false)
    }
  }

  if(query.length<3){
    setMovies([])
    setErr("")
    return;
  }

    fetchMovies();
    return function(){
      controller.abort()
    }
  },[query])


  useEffect(function(){
    localStorage.setItem("watched",JSON.stringify(watched)); // storing watched movies in local storage 
  },[watched])


  return (
    <>
      <Header movies={movies} query={query} setQuery={setQuery}/>
      <div className="flex justify-center gap-6">
        <Movies>
          {loading&&<Loading/>}
          {!loading&&!err&&<Movie movies={movies} handleClick={handleClick}/>}
          {err&&<Error err={err}/>}
        </Movies>
        {movieId?<MovieDetails movieId={movieId} handleClose={handleClose} handleAddWatched={handleAddWatched}/>:<Watched handleRemove={handleRemove} watched={watched} setWatched={setWatched}/>}
      </div>
    </>
  )
}

function Error({err}){
  return(
    <h1 className="text-white text-2xl mt-10">{err}</h1>
  )
}

function Header({query,setQuery,movies})
{

  return(
    <header className="flex bg-indigo-600 justify-evenly h-12 rounded-lg">
      <h1 className="text-2xl font-bold font-sans text-white mt-1">🍿 usePopcorn</h1>
      <input value={query} onChange={(e)=>setQuery(e.target.value)}
      className=" w-80 h-8 mt-2 rounded-sm bg-indigo-500 text-center text-xl text-indigo-300" type="text" placeholder="Search movies..."/>
      <p className="text-2xl text-white font-sans mt-1">Found {movies.length} results</p>
    </header>
  )
}

function Movies({children})
{
  
  return(
    <div className="mt-4 bg-gray-900 w-[500px] rounded-lg">
      <button className="text-white absolute top-[110px] left-[715px] bg-gray-950 rounded-full w-8 h-8 p-1">-</button>
      {children}
    </div>
  )
}

function Loading()
{
  return(
    <h1 className="text-white text-2xl mt-10">LOADING...</h1>
  )
}

function Watched({watched,setWatched,handleRemove})
{
  return(
    <div className="mt-4 bg-gray-900 w-[500px] rounded-lg p-2"> 
      <button className="text-white absolute right-[265px] top-[105px] bg-gray-950 rounded-full w-8 h-8 p-1">-</button>
      <div className="bg-gray-700 rounded-lg p-1 grid">
        <h1 className="text-white font-semibold p-1 ml-[-17.5rem]">MOVIES YOU WATCHED</h1>
        <Details watched={watched}/>
      </div>
      <MoviesWatched watched={watched} setWatched={setWatched} handleRemove={handleRemove}/>
    </div>
  )
}

function Details({watched}){
  const n = watched.length
  var avgIR = 0;
  var avgUR = 0;
  var avgT = 0;
  if(watched.length>0){
    watched.map((movie)=>
      avgIR+=movie.imdbRating)
      avgIR=(avgIR/n).toFixed(2);
    
      
      watched.map((movie)=>
      avgUR+=movie.userRating)
      avgUR=(avgUR/n).toFixed(2);
    
     
      watched.map((movie)=>
      avgT+=Number(movie.Runtime.split(' ')[0]))
      avgT=(avgT/n).toFixed(2);
  }
  console.log(watched);
  
  
  return(
    <>
      <div className="flex gap-3 text-white">
        <p>🎥 {n} Movies</p>
        <p>⭐  {avgIR}</p>
        <p>🌟  {avgUR}</p>
        <p>⏲ {avgT} min</p>
      </div>
    </>
  )
}

function MoviesWatched({watched,handleRemove})
{
  return(
    <>  
    <ul className="grid gap-6 p-5 bg-gray-900 w-96">
      {watched.map((movie)=>
        <li key={movie.imdbID} className="flex gap-3 border-b border-gray-800 pb-2">
          <img src={movie.Poster} alt={movie.Title} className="w-8 h-14"/>
          <div className="text-white text-start">
            <h1 className="font-semibold">{movie.Title}</h1>
            <div className="flex gap-4">
              <p>⭐{movie.imdbRating}</p>
              <p>🌟{movie.userRating}</p>
              <p>⏲{movie.Runtime}</p>
            </div>
          </div>
          <button className="mt-4 ml-8" onClick={()=>handleRemove(movie.imdbID)}> ❌ </button>
        </li>)}
    </ul>
    </>
  )
}

function Movie({movies,handleClick})
{ 

  return(
      <ul className="grid gap-6 p-5 bg-gray-900 w-96">{movies.map((movie)=>
        <li key={movie.imdbID} className="flex gap-3 border-b border-gray-800 pb-2 hover:bg-slate-700 cursor-pointer"
        onClick={()=>handleClick(movie.imdbID)}>
          <img src={movie.Poster} alt={movie.Title} className="w-8 h-14"/>
          <div className="text-white flex flex-col items-start text-start">
            <h2>{movie.Title}</h2>
            <p>📅 {movie.Year}</p>
          </div>
        </li>)}</ul>
  )
}


function MovieDetails({movieId,handleClose,handleAddWatched})
{

  
  const [movies,setMovies]=useState({})
  const [loading,setLoading]=useState(false);
  const [userRating,setUserRating]=useState('')

  useEffect(function(){
    async function getDetails(){
      try{
        setLoading(true)
        const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&i=${movieId}`);
        const data = await res.json();
        setMovies(data);
      }
      catch(err){
        console.log(err);
        
      }
      finally{
        setLoading(false)
      }
    }
    getDetails()
  },[movieId])

  useEffect(function(){
    if(!movies.Title)
      return;
    document.title=`MOVIE | ${movies.Title}`

    return function(){ // CLEANUP FUNCTION
      document.title='MOVIES APP'
    }
  },[movies.Title])


  if(loading){
  return <Loading/>
  }
  
  function Add(){
    const newMovie={
      imdbID:movieId,
      Title:movies.Title,
      Poster:movies.Poster,
      imdbRating:Number(movies.imdbRating),
      userRating,
      Runtime:movies.Runtime
    };
    handleAddWatched(newMovie)
  }
  
  
  return(
    <div className="mt-4 bg-gray-900 w-[500px] rounded-lg">
      <button className="text-white absolute left-[775px] top-[105px] bg-white rounded-full w-8 h-8 p-1"
      onClick={()=>handleClose()}> ⬅ </button>
      <button className="text-white absolute right-[265px] top-[105px] bg-gray-950 rounded-full w-8 h-8 p-1">-</button>
      <div className="flex bg-gray-700 rounded-lg">
      <img src={movies.Poster} alt={movies.Title} className="w-44"/>
      <div className="text-white grid gap-4 justify-center p-6 content-center">
        <h1 className="text-2xl font-sans text-white font-bold">{movies.Title}</h1>
        <p>{movies.Released} . {movies.Runtime}</p>
        <p>{movies.Genre}</p>
        <p className="italic">🌟 {movies.imdbRating} IMDB rating</p>
      </div>
    </div>
    <div className="bg-gray-700 p-5 mt-6 rounded-lg w-3/4 ml-12">
      <StarRating maxRating={10} onSetRating={setUserRating}/>
      {userRating>0&&(<button className="bg-indigo-600 text-white rounded-lg p-3 mt-4 w-48 hover:bg-indigo-800"
      onClick={Add}> + Add to List</button>)}
    </div>
    <div className="text-white flex flex-col gap-6 items-start p-8 text-start">
      <p className="italic font-serif">{movies.Plot}</p>
      <p> Starring : {movies.Actors}</p>
      <p>Directed by : {movies.Director}</p>
    </div>
      
    </div>
  )
}

export default App
