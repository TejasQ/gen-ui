export async function Movies({ movies }: any) {
  return (
    <div className="flex gap-2 items-center justify-start">
      {movies.map((movie: any) => (
        <a
          href={
            "https://www.imdb.com/find/?q=" + encodeURIComponent(movie.title)
          }
          target="_blank"
          key={movie._id}
          className="w-[100px] overflow-hidden shadow h-[150px] rounded transition-all hover:-translate-y-2 bg-cover bg-center bg-gray-400 relative"
          style={{ backgroundImage: `url(${movie.poster})` }}
        >
          <div className="p-1 text-xs absolute left-0 bottom-0 text-white w-full bg-black bg-opacity-70 backdrop-blur-lg">
            {movie.title}
          </div>
        </a>
      ))}
    </div>
  );
}
