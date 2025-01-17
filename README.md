# React Movies App Project

This project helps in fetching movies based on the given input search and shows details about the particular movie when selected.

It makes use of an API from OMDB for data fetching which is handled using the useEffect React hook. When the response is achieved, a list of movies related to the search are shown. The user can click on the movie interested in and get details on the same.
It also provides the functionality to rate a particular movie the user has watched and stores information about the watched movie and the given rating and displays them on the other half.

A re-usable Star Rating Component was also designed in this project which helps in rating a particular movie and can be customized as per requirements.

Browser's Locale Storage is used to store the movies watched by the user temporarily. All state management is done using useState React hook and useRef is also used wherever necessary. Styling in the entire project is done using Tailwind CSS.
