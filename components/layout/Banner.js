export default function Banner() {
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="relative rounded-[40px] overflow-hidden shadow-2xl group cursor-pointer bg-kraft">
        <img 
          src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1600" 
          className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt="Banner PersonalizArte"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-kraft/80 via-kraft/40 to-transparent flex items-end p-8 md:p-16">
          <div className="text-pastelPink max-w-xl">
            <h2 className="text-3xl md:text-5xl font-cursive mb-4 leading-none">
              Sua marca em <br/> todos os momentos.
            </h2>
            <p className="text-base md:text-lg opacity-90 mb-8 font-medium">
              Personalizados exclusivos com a qualidade 012.
            </p>
            <button className="bg-pastelPink text-white font-black px-10 py-4 rounded-full uppercase text-xs tracking-widest hover:bg-pastelBlue transition-all shadow-xl">
              Ver Coleção Completa
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
