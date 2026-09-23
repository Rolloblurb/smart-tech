"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FaFacebookF, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { supabase } from "@/lib/supabase";

const categories = [
  { title: "Home Appliances", image: "/images/categories/home-appliances.jpg", text: "Smart appliances for easier everyday living." },
  { title: "Solar & Backup Power", image: "/images/categories/solar-systems.jpg", text: "Reliable solar, inverter and backup power solutions." },
  { title: "Smart Electronics & Gadgets", image: "/images/categories/smart-electronics.jpg", text: "Connected gadgets, audio, security and everyday tech." },
  { title: "Computing & Office", image: "/images/categories/computing-office.jpg", text: "Laptops, monitors, printers and office essentials." },
];


const heroSlides = [
  {
    eyebrow: "SMART HOME APPLIANCES",
    title: "Smarter Appliances.",
    highlight: "Better Everyday Living.",
    description:
      "Discover quality appliances designed to make modern Kenyan homes more comfortable and convenient.",
    image: "/images/categories/home-appliances.jpg",
  },
  {
    eyebrow: "SMART ELECTRONICS & GADGETS",
    title: "Stay Connected.",
    highlight: "Live Smarter.",
    description:
      "Explore smartwatches, audio, networking, security, power accessories and useful everyday technology.",
    image: "/images/categories/smart-electronics.jpg",
  },
  {
    eyebrow: "SOLAR & BACKUP POWER",
    title: "Reliable Energy.",
    highlight: "Power When You Need It.",
    description:
      "Explore dependable solar, inverter and backup power solutions for homes, businesses and everyday life.",
    image: "/images/categories/solar-systems.jpg",
  },
  {
    eyebrow: "COMPUTING & OFFICE",
    title: "Work Smarter.",
    highlight: "Stay Productive.",
    description:
      "Shop laptops, monitors, printers, computer accessories and networking essentials for work and study.",
    image: "/images/categories/computing-office.jpg",
  },
];



type StoreProduct = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  cash_price: number;
  availability: string;
  stock_quantity: number;
  lipa_mdogo_mdogo_available: boolean;
  deposit_amount: number | null;
  daily_payment: number | null;
  payment_days: number | null;
  total_payable: number | null;
  product_images: { image_url: string; display_order: number }[];
};

type CookieChoice = "all" | "necessary";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [cookieChoice, setCookieChoice] = useState<CookieChoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesCategory =
      selectedCategory === "All Products" || product.category === selectedCategory;
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.description ?? "").toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const showCategory = (category: string) => {
    setSelectedCategory(category);
    window.setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };


  useEffect(() => {
    const savedChoice = window.localStorage.getItem("smart-tech-cookie-consent");
    if (savedChoice === "all" || savedChoice === "necessary") {
      setCookieChoice(savedChoice);
    }

    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError("");

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          category,
          description,
          cash_price,
          availability,
          stock_quantity,
          lipa_mdogo_mdogo_available,
          deposit_amount,
          daily_payment,
          payment_days,
          total_payable,
          product_images (
            image_url,
            display_order
          )
        `)
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) {
        setProductsError("We could not load the product catalogue right now.");
        setProducts([]);
      } else {
        const normalized = ((data ?? []) as StoreProduct[]).map((product) => ({
          ...product,
          product_images: [...(product.product_images ?? [])].sort(
            (a, b) => a.display_order - b.display_order
          ),
        }));
        setProducts(normalized);
      }

      setProductsLoading(false);
    };

    loadProducts();
  }, []);

  const saveCookieChoice = (choice: CookieChoice) => {
    window.localStorage.setItem("smart-tech-cookie-consent", choice);
    setCookieChoice(choice);
  };

  useEffect(() => {
    if (heroPaused) return;

    const timer = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroPaused]);

  const showNextSlide = () =>
    setCurrentSlide((current) => (current + 1) % heroSlides.length);

  const showPreviousSlide = () =>
    setCurrentSlide(
      (current) => (current - 1 + heroSlides.length) % heroSlides.length,
    );

  const submitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!feedbackName.trim() || !feedbackText.trim()) return;

    const { error } = await supabase.from("customer_reviews").insert({
      customer_name: feedbackName.trim(),
      rating: feedbackRating,
      feedback: feedbackText.trim(),
      approved: false,
    });

    if (error) {
      window.alert("We could not submit your feedback right now. Please try again.");
      return;
    }

    setFeedbackSubmitted(true);
    setFeedbackName("");
    setFeedbackText("");
    setFeedbackRating(5);
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#0b2947]">
      <div className="bg-[#073a63] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-2 text-xs sm:px-6">
          <div className="flex flex-wrap gap-5">
            <span>📍 Kenya</span><span>🚚 Countrywide Delivery</span><span>🛡️ Secure Payments</span>
          </div>
          <span className="hidden sm:block">Smart Products. A Brighter Tomorrow.</span>
        </div>
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-4 sm:px-6">
          <Image src="/images/logo/smart-tech-logo.jpg" alt="Smart Tech" width={220} height={110} priority className="h-16 w-auto object-contain" />
          <div className="hidden flex-1 overflow-hidden rounded-lg border border-slate-300 transition duration-200 focus-within:border-[#0798ef] focus-within:ring-4 focus-within:ring-sky-100 md:flex">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="min-w-0 flex-1 px-4 py-3 text-sm outline-none"
              placeholder="Search products or categories..."
            />
            <button type="button" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} className="bg-[#0798ef] px-6 text-white transition duration-200 hover:bg-[#087bd0] hover:shadow-[0_0_22px_rgba(7,152,239,.45)] active:scale-95" aria-label="Search catalogue">🔍</button>
          </div>
          <div className="ml-auto hidden gap-6 text-sm font-bold lg:flex"><span>👤 Account</span><span>🛒 Cart (0)</span></div>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="ml-auto rounded-lg border px-4 py-3 transition duration-200 hover:border-[#0798ef] hover:bg-sky-50 active:scale-95 md:hidden">☰</button>
        </div>
        <nav className="border-t border-slate-100">
          <div className="mx-auto hidden max-w-7xl items-center justify-between px-4 text-sm font-bold md:flex sm:px-6">
            <a className="bg-[#0798ef] px-6 py-4 text-white transition duration-200 hover:bg-[#087bd0]" href="#home">Home</a>
            {["Home Appliances", "Solar & Backup Power", "Smart Electronics & Gadgets", "Computing & Office"].map((item) => (
              <button key={item} type="button" onClick={() => showCategory(item)} className={`relative py-4 transition duration-200 hover:text-[#0798ef] ${selectedCategory === item ? "text-[#0798ef]" : ""}`}>{item}</button>
            ))}
            <a href="#lipa" className="relative py-4 transition duration-200 hover:text-[#0798ef]">Lipa Mdogo Mdogo</a>
            <a href="#products" className="relative py-4 transition duration-200 hover:text-[#0798ef]">Deals</a>
            <a href="#about" className="relative py-4 transition duration-200 hover:text-[#0798ef]">About Us</a>
            <a href="#contact" className="relative py-4 transition duration-200 hover:text-[#0798ef]">Contact</a>
          </div>
          {menuOpen && <div className="grid gap-2 px-5 py-4 font-bold md:hidden">
            {["Home","Home Appliances","Solar & Backup Power","Smart Electronics & Gadgets","Computing & Office","Lipa Mdogo Mdogo","Deals","About Us","Contact"].map(x => <a key={x} href={x==="Home"?"#home":"#categories"} onClick={()=>setMenuOpen(false)} className="py-2">{x}</a>)}
          </div>}
        </nav>
      </header>

      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-r from-[#062c4a] via-[#074c79] to-[#0a75a7] text-white"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[.35em] text-cyan-200 transition-all duration-500">
              {heroSlides[currentSlide].eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
              {heroSlides[currentSlide].title}
              <span className="block text-[#25b9ff]">
                {heroSlides[currentSlide].highlight}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              {heroSlides[currentSlide].description}
            </p>

            <div className="mt-6 inline-block rounded-xl bg-[#ffb51b] px-5 py-3 font-black text-[#082d4c] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,181,27,.45)]">
              Flexible Payment Options on Selected Products
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#products"
                className="rounded-lg bg-[#0798ef] px-6 py-4 font-black transition duration-200 hover:-translate-y-1 hover:bg-[#12a8ff] hover:shadow-[0_0_28px_rgba(7,152,239,.55)] active:translate-y-0 active:scale-95"
              >
                Shop Now →
              </a>
              <a
                href="#lipa"
                className="rounded-lg border border-white/50 px-6 py-4 font-black transition duration-200 hover:-translate-y-1 hover:border-white hover:bg-white/10 hover:shadow-[0_0_24px_rgba(255,255,255,.18)] active:scale-95"
              >
                Explore Lipa Mdogo Mdogo
              </a>
            </div>

            <div className="mt-10 grid gap-4 text-sm sm:grid-cols-3">
              {[
                ["🚚", "Countrywide Delivery"],
                ["🛡️", "Secure Payments"],
                ["🎧", "Customer Support"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 transition duration-200 hover:-translate-y-1 hover:bg-white/10"
                >
                  <span>{icon}</span> <b>{label}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative h-[360px] overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl sm:h-[430px]">
              {heroSlides.map((slide, index) => (
                <Image
                  key={slide.image}
                  src={slide.image}
                  alt={slide.eyebrow}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-cover transition-all duration-700 ${
                    currentSlide === index
                      ? "scale-100 opacity-100"
                      : "pointer-events-none scale-105 opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#052b49]/55 via-transparent to-transparent" />

              <button
                type="button"
                onClick={showPreviousSlide}
                className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/30 text-2xl text-white backdrop-blur transition duration-200 hover:scale-110 hover:bg-[#0798ef] hover:shadow-[0_0_22px_rgba(7,152,239,.55)] active:scale-95"
                aria-label="Previous hero slide"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={showNextSlide}
                className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/30 text-2xl text-white backdrop-blur transition duration-200 hover:scale-110 hover:bg-[#0798ef] hover:shadow-[0_0_22px_rgba(7,152,239,.55)] active:scale-95"
                aria-label="Next hero slide"
              >
                ›
              </button>

              <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.eyebrow}
                    type="button"
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? "w-9 bg-white"
                        : "w-2.5 bg-white/45 hover:bg-white/75"
                    }`}
                    aria-label={`Show ${slide.eyebrow}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
  id="categories"
  className="mx-auto max-w-7xl px-4 py-14 sm:px-6"
>
  <h2 className="text-3xl font-black">
    Shop by Category
  </h2>

  <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
    {categories.map((c) => (
      <button
        key={c.title}
        type="button"
        onClick={() => showCategory(c.title)}
        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-2 hover:border-sky-300 hover:shadow-[0_18px_45px_rgba(8,73,121,.16)]"
      >
        <div className="relative h-52 overflow-hidden">
          <Image
            src={c.image}
            alt={c.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        </div>

        <div className="p-5">
          <h3 className="font-black">
            {c.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {c.text}
          </p>
        </div>
      </button>
    ))}

    <article
      id="lipa"
      className="group rounded-2xl bg-gradient-to-br from-[#087ee8] to-[#06437c] p-6 text-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(8,126,232,.28)]"
    >
      <p className="text-sm font-black uppercase tracking-wider text-cyan-100">
        Flexible Payments
      </p>

      <h3 className="mt-3 text-3xl font-black">
        Lipa Mdogo Mdogo
      </h3>

      <p className="mt-3 leading-7 text-white/80">
        Get selected products with a deposit and convenient daily payments.
      </p>

      <div className="mt-8 rounded-xl bg-white/15 p-4 transition duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_24px_rgba(255,255,255,.12)]">
        <b>Deposit + Daily Payments</b>

        <p className="mt-1 text-sm text-white/70">
          Clear payment terms on eligible products.
        </p>
      </div>
    </article>
  </div>
</section>

      <section id="products" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-xs font-black uppercase tracking-[.3em] text-[#0798ef]">Smart Tech Catalogue</p>
          <h2 className="mt-2 text-3xl font-black">Latest Products</h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Real products will appear here as they are added to Smart Tech. Each product will have its own photos,
            specifications, cash price and Lipa Mdogo Mdogo terms where available.
          </p>

          <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {["All Products", ...categories.map((category) => category.title)].map((category) => (
                <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`rounded-full px-4 py-2 text-sm font-black transition ${selectedCategory === category ? "bg-[#0798ef] text-white shadow" : "border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-[#0798ef]"}`}>
                  {category}
                </button>
              ))}
            </div>
            {(searchQuery || selectedCategory !== "All Products") && (
              <button type="button" onClick={() => { setSearchQuery(""); setSelectedCategory("All Products"); }} className="shrink-0 text-sm font-black text-[#0798ef] hover:underline">
                Clear filters
              </button>
            )}
          </div>

          {!productsLoading && !productsError && products.length > 0 && (
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Showing {filteredProducts.length} of {products.length} products
              {selectedCategory !== "All Products" ? ` in ${selectedCategory}` : ""}
              {searchQuery.trim() ? ` matching "${searchQuery.trim()}"` : ""}.
            </p>
          )}
          {productsLoading ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0798ef]" />
              <p className="mt-4 font-bold text-slate-500">Loading products...</p>
            </div>
          ) : productsError ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              {productsError}
            </div>
          ) : products.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-sky-200 bg-gradient-to-br from-sky-50 to-white p-10 text-center">
              <div className="text-5xl">🛍️</div>
              <h3 className="mt-4 text-2xl font-black">New products are coming soon</h3>
              <p className="mt-2 text-slate-500">Check back shortly for the latest Smart Tech catalogue.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <div className="text-5xl">🔎</div>
              <h3 className="mt-4 text-2xl font-black">No products found</h3>
              <p className="mt-2 text-slate-500">Try another search or choose a different product category.</p>
              <button type="button" onClick={() => { setSearchQuery(""); setSelectedCategory("All Products"); }} className="mt-5 rounded-xl bg-[#0798ef] px-5 py-3 font-black text-white">
                Show All Products
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const image = product.product_images?.[0]?.image_url;
                const whatsappText = encodeURIComponent(
                  `Hello Smart Tech, I am interested in ${product.name}. Please share more information about the cash and Lipa Mdogo Mdogo options.`
                );

                return (
                  <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      {image ? (
                        <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full place-items-center text-5xl">🛍️</div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#0b2947] shadow">
                        {product.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-black text-[#0b2947]">{product.name}</h3>
                      {product.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{product.description}</p>
                      )}

                      <p className="mt-4 text-xl font-black text-[#0798ef]">
                        KSh {new Intl.NumberFormat("en-KE").format(product.cash_price)}
                      </p>

                      <p className={`mt-1 text-xs font-bold ${product.availability === "Available" ? "text-emerald-700" : "text-amber-700"}`}>
                        {product.availability}
                      </p>

                      {product.lipa_mdogo_mdogo_available && (
                        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm">
                          <p className="font-black text-emerald-800">Lipa Mdogo Mdogo</p>
                          <p className="mt-1 text-emerald-700">
                            Deposit KSh {new Intl.NumberFormat("en-KE").format(product.deposit_amount ?? 0)}
                            {" • "}
                            KSh {new Intl.NumberFormat("en-KE").format(product.daily_payment ?? 0)}/day
                          </p>
                        </div>
                      )}

                      <a
                        href={`https://wa.me/254785709176?text=${whatsappText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[.98]"
                      >
                        <FaWhatsapp />
                        Enquire on WhatsApp
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-[#e2f2ff] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-lg"><h3 className="text-2xl font-black">Modern Appliances</h3><p className="mt-2">Smart products for easier everyday living.</p></div>
        <div className="rounded-2xl bg-[#d9efff] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-lg"><h3 className="text-2xl font-black">Solar & Backup Power</h3><p className="mt-2">Reliable energy solutions for home and business.</p></div>
        <div className="rounded-2xl bg-[#fff0dc] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-lg"><h3 className="text-2xl font-black">Smart Electronics</h3><p className="mt-2">Connected gadgets, security, audio and everyday tech.</p></div>
        <div className="rounded-2xl bg-[#eef2ff] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-lg"><h3 className="text-2xl font-black">Computing & Office</h3><p className="mt-2">Technology for work, study and productivity.</p></div>
      </section>

      <section id="about" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-center sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className="rounded-2xl p-4 transition duration-200 hover:-translate-y-1 hover:bg-sky-50"><p className="text-3xl">💎</p><b>Quality Products</b><p className="text-sm text-slate-500">Trusted products for your home</p></div>
          <div className="rounded-2xl p-4 transition duration-200 hover:-translate-y-1 hover:bg-sky-50"><p className="text-3xl">🚚</p><b>Countrywide Delivery</b><p className="text-sm text-slate-500">Right to your doorstep</p></div>
          <div className="rounded-2xl p-4 transition duration-200 hover:-translate-y-1 hover:bg-sky-50"><p className="text-3xl">🛡️</p><b>Secure Payments</b><p className="text-sm text-slate-500">Safe &amp; hassle-free</p></div>
          <div className="rounded-2xl p-4 transition duration-200 hover:-translate-y-1 hover:bg-sky-50"><p className="text-3xl">🎧</p><b>Customer Support</b><p className="text-sm text-slate-500">We&apos;re here to help</p></div>
        </div>
      </section>

      <section id="feedback" className="border-t border-slate-200 bg-[#f7f9fc]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[.3em] text-[#0798ef]">
                Customer Experience
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Your Feedback Matters
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">
                Tell us about your Smart Tech experience. Your feedback helps
                us improve our products, delivery and customer service.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="text-2xl tracking-1 text-amber-400">
                  ★★★★★
                </div>
                <div>
                  <p className="font-black">Share your experience</p>
                  <p className="text-sm text-slate-500">
                    Rate Smart Tech from 1 to 5 stars.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFeedbackOpen((current) => !current);
                  setFeedbackSubmitted(false);
                }}
                className="mt-7 rounded-lg bg-[#0798ef] px-6 py-3.5 font-black text-white transition duration-200 hover:-translate-y-1 hover:bg-[#087bd0] hover:shadow-[0_0_28px_rgba(7,152,239,.45)] active:translate-y-0 active:scale-95"
              >
                {feedbackOpen ? "Close Feedback Form" : "Leave Feedback"}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              {feedbackSubmitted ? (
                <div className="py-8 text-center">
                  <div className="text-5xl">✓</div>
                  <h3 className="mt-4 text-2xl font-black text-[#0b2947]">
                    Thank You
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Your feedback has been submitted successfully and is awaiting
                    Smart Tech admin approval before appearing publicly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackSubmitted(false);
                      setFeedbackOpen(true);
                    }}
                    className="mt-6 font-black text-[#0798ef] hover:underline"
                  >
                    Leave another review
                  </button>
                </div>
              ) : feedbackOpen ? (
                <form onSubmit={submitFeedback} className="space-y-5">
                  <div>
                    <label
                      htmlFor="feedback-name"
                      className="text-sm font-black text-[#0b2947]"
                    >
                      Your Name
                    </label>
                    <input
                      id="feedback-name"
                      value={feedbackName}
                      onChange={(event) => setFeedbackName(event.target.value)}
                      required
                      placeholder="Enter your name"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-[#0798ef] focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <fieldset>
                    <legend className="text-sm font-black text-[#0b2947]">
                      Your Rating
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFeedbackRating(rating)}
                          className={`grid h-11 w-11 place-items-center rounded-xl border text-xl transition duration-200 active:scale-90 ${
                            rating <= feedbackRating
                              ? "border-amber-300 bg-amber-50 text-amber-500"
                              : "border-slate-200 bg-white text-slate-300 hover:border-amber-200"
                          }`}
                          aria-label={`${rating} star rating`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label
                      htmlFor="feedback-message"
                      className="text-sm font-black text-[#0b2947]"
                    >
                      Your Feedback
                    </label>
                    <textarea
                      id="feedback-message"
                      value={feedbackText}
                      onChange={(event) => setFeedbackText(event.target.value)}
                      required
                      rows={5}
                      placeholder="Tell us about your experience..."
                      className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-[#0798ef] focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#0798ef] px-6 py-3.5 font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#087bd0] hover:shadow-[0_0_24px_rgba(7,152,239,.4)] active:translate-y-0 active:scale-[.98]"
                  >
                    Submit Feedback
                  </button>
                </form>
              ) : (
                <div className="py-10 text-center">
                  <div className="text-5xl">💬</div>
                  <h3 className="mt-4 text-2xl font-black">
                    We&apos;d Love to Hear From You
                  </h3>
                  <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
                    Use the feedback button to rate your experience and leave
                    a message for Smart Tech.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[#06365b] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div><Image src="/images/logo/smart-tech-logo.jpg" alt="Smart Tech" width={190} height={95} className="h-16 w-auto rounded bg-white object-contain" /><p className="mt-4 max-w-sm text-sm leading-6 text-white/70">Your trusted partner for home appliances, solar & backup power, smart electronics, gadgets, computing and office technology.</p></div>
          <div><h3 className="font-black">Quick Links</h3><div className="mt-4 grid gap-2 text-sm text-white/70"><a href="#home">Home</a><a href="#products">Shop</a><a href="#about" className="relative py-4 transition duration-200 hover:text-[#0798ef] after:absolute after:bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-[#0798ef] after:transition-all after:duration-200 hover:after:w-full">About Us</a><a href="#contact" className="relative py-4 transition duration-200 hover:text-[#0798ef] after:absolute after:bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-[#0798ef] after:transition-all after:duration-200 hover:after:w-full">Contact</a></div></div>
          <div>
            <h3 className="font-black">Contact Us</h3>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <p className="flex items-start gap-2"><MdLocationOn className="mt-0.5 shrink-0 text-lg text-black" /><span>Gaberone Plaza, 4th Floor, Shop A13, Nairobi, Kenya</span></p>
              <a href="mailto:smarttechbetterliving@gmail.com" className="flex items-center gap-2 transition hover:text-white"><MdEmail className="inline text-lg text-black" /> <span>smarttechbetterliving@gmail.com</span></a>
              <a href="https://wa.me/254785709176?text=Hello%20Smart%20Tech.%20I%20would%20like%20to%20make%20an%20enquiry." target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-white"><FaWhatsapp className="inline text-lg text-black" /> <span>+254 785 709 176</span></a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="https://wa.me/254785709176?text=Hello%20Smart%20Tech.%20I%20would%20like%20to%20make%20an%20enquiry." target="_blank" rel="noopener noreferrer" aria-label="Contact Smart Tech on WhatsApp" title="WhatsApp" className="grid h-12 w-12 place-items-center rounded-full border border-black/20 bg-white text-xl text-black transition duration-200 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(0,0,0,.25)] active:scale-95"><FaWhatsapp /></a>
              <a href="https://www.facebook.com/share/1L7s2XPwM5/" target="_blank" rel="noopener noreferrer" aria-label="Visit Smart Tech on Facebook" title="Facebook" className="grid h-12 w-12 place-items-center rounded-full border border-black/20 bg-white text-xl text-black transition duration-200 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(0,0,0,.25)] active:scale-95"><FaFacebookF /></a>
              <a href="https://www.tiktok.com/@smart.tech.applia0" target="_blank" rel="noopener noreferrer" aria-label="Visit Smart Tech on TikTok" title="TikTok" className="grid h-12 w-12 place-items-center rounded-full border border-black/20 bg-white text-xl text-black transition duration-200 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(0,0,0,.25)] active:scale-95"><FaTiktok /></a>
              <a href="mailto:smarttechbetterliving@gmail.com" aria-label="Email Smart Tech" title="Email" className="grid h-12 w-12 place-items-center rounded-full border border-black/20 bg-white text-xl text-black transition duration-200 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(0,0,0,.25)] active:scale-95"><MdEmail /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/15 px-4 py-5 text-center text-xs text-white/60">© 2026 SMART TECH. All rights reserved. • Smart Products. A Brighter Tomorrow.</div>
      </footer>

      {cookieChoice === null && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <h2 className="font-black text-[#0b2947]">We use cookies</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Smart Tech uses necessary browser storage to keep the website working. With your permission, optional cookies may be used later to improve your experience and measure website performance.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => saveCookieChoice("necessary")}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Reject Optional
              </button>
              <button
                type="button"
                onClick={() => saveCookieChoice("all")}
                className="rounded-xl bg-[#0798ef] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#087bd0]"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
