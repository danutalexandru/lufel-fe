import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Video Hero Section: full height on mobile for portrait video, desktop heights from md up */}
      <section className="relative h-[100vh] sm:h-[100vh] md:h-[80vh] lg:h-[90vh] overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 w-full h-full">
            {/* Mobile video: full viewport height, object-contain so entire portrait video fits */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-contain object-center md:hidden"
              aria-label="Video hero mobil"
            >
              <source src="/videos/hero-mobile.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Desktop video: fills area, hidden on small screens, visible from md up */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover hidden md:block"
              aria-label="Video hero desktop"
            >
              <source src="/videos/hero-desktop.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {/* Gradient overlay */}
          <div className="absolute top-0 left-0 w-full h-40 sm:h-48 md:h-56 bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        </div>
        {/* Content overlay */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">
              Ceramică Artizanală
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto drop-shadow-md px-2">
              Ceramică frumoasă și unică, creată cu pasiune și atenție la detalii
            </p>
            <Link
              to="/shop"
              className="inline-block bg-white text-gray-900 px-5 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base md:text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Explorează Magazinul
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-ceramic-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Despre Artist</h2>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                Bine ai venit în atelierul meu de ceramică! Sunt un artist ceramic pasionat, dedicat creării
                de piese frumoase și funcționale care aduc arta în viața de zi cu zi. Fiecare piesă este
                realizată manual cu grijă, folosind tehnici tradiționale combinate cu sensibilități de design
                moderne.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                Munca mea se concentrează pe crearea de piese unice, de neînlocuit, care sărbătoresc frumusețea
                naturală a argilei. De la veselă funcțională la piese de artă decorative, fiecare creație
                spune o poveste și adaugă caracter casei tale.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Cred că ceramica nu este doar despre crearea de obiecte, ci despre păstrarea
                tradițiilor, exprimarea creativității și aducerea bucuriei în momentele de zi cu zi.
              </p>
            </div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden order-1 md:order-2">
              <img
                src="/artist-photo.jpg"
                alt="Artist la lucru"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400">Fotografie Artist</div>';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-ceramic-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">Lucrări Selectate</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm sm:text-base">
                  Imagine Galerie {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section removed at user's request */}
    </div>
  );
};

export default Home;

