import React from "react";

const About: React.FC = () => {
  return (
    <>
      <style>
        {`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          .signature-gradient {
            background: linear-gradient(135deg, #970012 0%, #c1121f 100%);
          }
        `}
      </style>

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-20 flex items-center">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-8 w-full">
          <div className="font-['Nunito'] text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tighter">
            Lotte Atelier
          </div>
          <div className="hidden md:flex items-center space-x-8 font-['Nunito'] text-sm tracking-wide uppercase font-semibold">
            <a
              className="text-[#C1121F] border-b-2 border-[#C1121F] pb-1"
              href="#"
            >
              Our Story
            </a>
            <a
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              href="#"
            >
              Curation
            </a>
            <a
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              href="#"
            >
              The Archive
            </a>
            <a
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              href="#"
            >
              Atelier
            </a>
            <a
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              href="#"
            >
              Contact
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-all duration-300 rounded-full">
              <span className="material-symbols-outlined text-neutral-900 dark:text-neutral-50">
                shopping_bag
              </span>
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative h-[665px] md:h-[768px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover brightness-75"
              data-alt="Cinematic high-end grocery boutique with soft warm lighting, artisan products on shelves, and a premium luxury retail atmosphere"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQncEbB5UraU1zRQjZNoHiNDOJZcPYkqIUGks4z99pKlZvuhw15nGi_j2msYRPBWiY8oFlLGGXllxgFJzqmts5qMEopI40SYBsMqVZDI6qNmNPisudO8H7UAftwtP3ECXvBKWFnBvpAqmdAUQedeB3ZAjEs5wBCmcq23uI9QbYQa74EqnHWmfEcOervKuuwAqxcLSvzOxnUimSoQuAi8Onyu2VgKZSF0vA-xscsLk_ff7xjnscoYsMjgENnCvb7Z2H27NQEGmJo0o"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface"></div>
          </div>
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <h1 className="font-headline text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-lg">
              Our Story
            </h1>
            <p className="text-white text-lg md:text-xl font-light mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Crafting a legacy of culinary excellence through curated selection and an uncompromising commitment to quality.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="px-8 py-3 signature-gradient text-white rounded-full font-semibold shadow-xl scale-100 hover:scale-105 active:scale-95 transition-all">
                Explore More
              </button>
              <button className="px-8 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-semibold hover:bg-white/30 transition-all">
                Contact Us
              </button>
            </div>
          </div>
        </section>

        {/* Our Story Content */}
        <section className="py-24 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">
                    The Heritage
                  </span>
                  <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface leading-tight">
                    A Journey of Taste and Precision
                  </h2>
                </div>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Founded on the principle that food is more than sustenance—it's an art form. Lotte Atelier began as a small curation house focused on sourcing the rarest ingredients from local artisans and global pioneers.
                </p>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Today, we stand as a beacon of luxury retail, where every product on our shelf tells a story of origin, craftsmanship, and the pursuit of perfection. Our mission is to bridge the gap between the producer's passion and the connoisseur's table.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/5 rounded-xl transition-transform group-hover:scale-105"></div>
                <img
                  className="relative rounded-xl shadow-2xl w-full aspect-[4/3] object-cover"
                  data-alt="Artisanal food preparation with fresh organic vegetables and high-end kitchen tools on a clean marble surface"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZEHsoq-ILQdHcp8kWw5tLi-rsftKNVuierP_M9JbL98U3jyRGfp4xbmFaIz0hseMNxyw7kzLHM9DigxID7AhQMDMbKOCYr1f1tyVE9vRPn9C3tmyVww1EayCjSxNdeQPoE1ddX7z7trsp9ogvhx_s5u9i5E0geefwzDFc1yVEuYAh9aGmecuHZqE0Hxkx5B-QCCDLC_z7dyC_pI44P3RUxvzk2XzThb0ImJfAX4XQH1nVfKR7HaJtGx-j3lLhCb8w_HFupeGgz1g"
                  alt=""
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-24 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-4">
              Our Mission
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              Elevating the everyday shopping experience into a curated journey of discovery.
            </p>
          </div>
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Mission Card 1 */}
            <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 text-primary group-hover:signature-gradient group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Purity &amp; Origin</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                We trace every product back to its source, ensuring ethical practices and absolute freshness from farm to atelier.
              </p>
            </div>

            {/* Mission Card 2 */}
            <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 text-primary group-hover:signature-gradient group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">eco</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Sustainable Luxury</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Luxury shouldn't cost the earth. Our operations are designed with a carbon-neutral footprint in mind.
              </p>
            </div>

            {/* Mission Card 3 */}
            <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 text-primary group-hover:signature-gradient group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">star</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Exceptional Service</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                A concierge-level approach to grocery shopping, providing personalized recommendations for your lifestyle.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-8 bg-surface-container-low rounded-xl">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">15+</div>
                <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Years of Heritage
                </div>
              </div>
              <div className="text-center p-8 bg-surface-container-low rounded-xl">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">850+</div>
                <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Artisan Partners
                </div>
              </div>
              <div className="text-center p-8 bg-surface-container-low rounded-xl">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">12</div>
                <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Global Awards
                </div>
              </div>
              <div className="text-center p-8 bg-surface-container-low rounded-xl">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2">50k+</div>
                <div className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Happy Clients
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-4">
                Our Core Values
              </h2>
              <p className="text-on-surface-variant">The pillars that define the Lotte Atelier experience.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {/* Value 1 */}
              <div className="flex flex-col items-center text-center p-8 bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-primary/10">
                  <img
                    className="w-full h-full object-cover"
                    data-alt="Portrait of a professional artisan producer with a warm and welcoming expression"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHtG1KlNL8R3NtNUiUlvFa5xqOJ-dPkm_RgFLW1eHXWMEb7LgrDNiD-XoOpLxn3a2OJmWrRLFZkrs3dolrYEB27tEqMEpJY3nA0OZjDQnalDV60hP6aGSxOgK5zH5fbOYDW8WfoWf_faj80Q7h8oLZSXx1sNhokokeVSih9zt8T9QNH8jOj2a-cDaiUQ-LxfJw4QTgXXrTQ3yXd5A6WtSyXGXOsBrp3tLsh68rxog2CNF0dAv4-8RVnPJkUrhCAFjsay4bnuDnGbE"
                    alt=""
                  />
                </div>
                <h4 className="text-lg font-bold mb-2">Authenticity</h4>
                <p className="text-on-surface-variant text-sm">
                  We value the real, the raw, and the honest. No compromises on true flavor.
                </p>
              </div>

              {/* Value 2 */}
              <div className="flex flex-col items-center text-center p-8 bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-primary/10">
                  <img
                    className="w-full h-full object-cover"
                    data-alt="Close up portrait of a smiling woman represent honesty and community service"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMxenFc5PXrj7dkt61UnVZgghnK8TZtZtEE4iU28w5N7SuTD43FF6TWPEv7tpzIfNSjj0BnUyWzPBEMit86v66buWtnKfU_N4xwfUKr-U7PI-HCixxqXpzQoNHulqpPapT8b4ueONuSDxuKzV7237Flv083HCHNwn7D2pmVdA-zgz8u2QvvxIFTfzY3LL0wKV9sMUghv6XYne8j-iBpsLeURelQ2gMzIS52hNhTea6ShDgjTKHn6pid3VVKU9vqf4erHLcqS4NMfA"
                    alt=""
                  />
                </div>
                <h4 className="text-lg font-bold mb-2">Community</h4>
                <p className="text-on-surface-variant text-sm">
                  Supporting the local ecosystems that provide us with nature's bounty.
                </p>
              </div>

              {/* Value 3 */}
              <div className="flex flex-col items-center text-center p-8 bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-primary/10">
                  <img
                    className="w-full h-full object-cover"
                    data-alt="Portrait of a confident expert curator for luxury grocery brand"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJfGXpApYt1PdcRgT1qA9vD6PZ3psylYTej0ig9-pak-p0q1v7nBGnwXOjlW8i-fkVjk5bDuh0wpz0pOWKufo2hW7zmvG1OUAGzwLGG5NBbB4T-Jab-Kp3VeDf2K-qTAulaAnDSFjNYw6tBbrzMSiO79Ip443rZx2TFB4nTCLRrdtvJr6e8kHebnOqnFxeFft5M6XYU3uhuLnakxgKfHR2MybLEhKafR-S8mbpLacpL0RIziawYrrKAEbFRCccariNkZf-oHEOPfY"
                    alt=""
                  />
                </div>
                <h4 className="text-lg font-bold mb-2">Excellence</h4>
                <p className="text-on-surface-variant text-sm">
                  A relentless pursuit of the highest quality standards in every category.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-xl overflow-hidden p-12 md:p-20 text-center">
              <img
                className="absolute inset-0 w-full h-full object-cover brightness-50"
                data-alt="Close up of high quality gourmet food ingredients in a professional kitchen setting with soft atmosphere"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCknneYHIegAz3zlS1mc4CvCzTR3tF_dHWEhRbT-lwL84hFSYqOarPj_VREsBVpoq70eot2avO-bid8DYW_tL1l9p7KnyGqmS2rZRgCQM5ToomlDmhkc-DpiopObrrMxhTdBsSFjMO8FCq4WVS6QgxQUDTxriqn6fS3tWD8wMlULjcCZem0bYOEl0JabdeKZ30LDBG9ESfujgnTVJk1ZyrAHxaaV5_3-KmicV7LifFS7svm7zLgwLDzh_ekYlsWmWHPn6UqtHaSM-s"
                alt=""
              />
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="font-headline text-3xl md:text-5xl font-black text-white mb-6">
                  Ready to Experience the Atelier?
                </h2>
                <p className="text-white/90 text-lg mb-10 leading-relaxed">
                  Join our exclusive circle of food enthusiasts and discover curated excellence today.
                </p>
                <button className="px-10 py-4 signature-gradient text-white rounded-full font-bold shadow-2xl hover:shadow-primary/20 transition-all scale-100 hover:scale-105">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      
    </>
  );
};

export default About;