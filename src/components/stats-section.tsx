'use client'

export function StatsSection() {
  return (
    <section className="relative w-full py-32 px-4 bg-black" style={{ zIndex: 10 }}>
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 font-marlinsoft text-white">
          It's That Easy
        </h2>
        <p className="text-xl md:text-2xl text-gray-400 mb-16 font-marlinsoft max-w-3xl mx-auto">
          Join thousands of creators who are already using Tasy to transform their content
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="flex flex-col items-center">
            <div className="text-5xl md:text-7xl font-bold text-white mb-4 font-marlinsoft">
              10K+
            </div>
            <div className="text-lg text-gray-400 font-marlinsoft">
              Photos Edited
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-5xl md:text-7xl font-bold text-white mb-4 font-marlinsoft">
              2.5K+
            </div>
            <div className="text-lg text-gray-400 font-marlinsoft">
              Active Users
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-5xl md:text-7xl font-bold text-white mb-4 font-marlinsoft">
              50K+
            </div>
            <div className="text-lg text-gray-400 font-marlinsoft">
              Posts Created
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

