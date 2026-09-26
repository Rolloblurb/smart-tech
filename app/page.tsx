"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { supabase } from "@/lib/supabase";

const PHONE_NUMBER = "+254785709176";

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



type StoreVariant = {
  id: string;
  product_id: string;
  variant_name: string;
  cash_price: number;
  availability: string;
  stock_quantity: number;
  lipa_mdogo_mdogo_available: boolean;
  deposit_amount: number | null;
  daily_payment: number | null;
  payment_days: number | null;
  total_payable: number | null;
  display_order: number;
};

type StoreProduct = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  specifications: string | null;
  cash_price: number;
  availability: string;
  stock_quantity: number;
  lipa_mdogo_mdogo_available: boolean;
  deposit_amount: number | null;
  daily_payment: number | null;
  payment_days: number | null;
  total_payable: number | null;
  product_images: { image_url: string; display_order: number }[];
  product_variants: StoreVariant[];
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
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [descriptionProduct, setDescriptionProduct] = useState<StoreProduct | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesCategory =
      selectedCategory === "All Products" || product.category === selectedCategory;
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.description ?? "").toLowerCase().includes(query) ||
      (product.specifications ?? "").toLowerCase().includes(query) ||
      (product.product_variants ?? []).some((variant) =>
        variant.variant_name.toLowerCase().includes(query)
      );
    return matchesCategory && matchesSearch;
  });

  const showCategory = (category: string) => {
    setSelectedCategory(category);
    window.setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };


  const openProductGallery = (product: StoreProduct, imageIndex = 0) => {
    setSelectedProduct(product);
    setActiveImageIndex(imageIndex);
    setImageZoom(1);
  };

  const closeProductGallery = () => {
    setSelectedProduct(null);
    setActiveImageIndex(0);
    setImageZoom(1);
  };

  const showPreviousProductImage = () => {
    if (!selectedProduct?.product_images.length) return;
    setActiveImageIndex((current) =>
      (current - 1 + selectedProduct.product_images.length) % selectedProduct.product_images.length
    );
    setImageZoom(1);
  };

  const showNextProductImage = () => {
    if (!selectedProduct?.product_images.length) return;
    setActiveImageIndex((current) =>
      (current + 1) % selectedProduct.product_images.length
    );
    setImageZoom(1);
  };

  useEffect(() => {
    if (!selectedProduct) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProductGallery();
      if (event.key === "ArrowLeft") showPreviousProductImage();
      if (event.key === "ArrowRight") showNextProductImage();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProduct]);

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
          specifications,
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
          ),
          product_variants (
            id,
            product_id,
            variant_name,
            cash_price,
            availability,
            stock_quantity,
            lipa_mdogo_mdogo_available,
            deposit_amount,
            daily_payment,
            payment_days,
            total_payable,
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
          product_variants: [...(product.product_variants ?? [])].sort(
            (a, b) => a.display_order - b.display_order
          ),
        }));

        const initialVariants: Record<string, string> = {};
        normalized.forEach((product) => {
          if (product.product_variants.length > 0) {
            initialVariants[product.id] = product.product_variants[0].id;
          }
        });

        setSelectedVariants(initialVariants);
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
         {menuOpen && (
  <div className="grid gap-2 px-5 py-4 font-bold md:hidden">
    <a
      href="#home"
      onClick={() => setMenuOpen(false)}
      className="py-2"
    >
      Home
    </a>

    {[
      "Home Appliances",
      "Solar & Backup Power",
      "Smart Electronics & Gadgets",
      "Computing & Office",
    ].map((category) => (
      <button
        key={category}
        type="button"
        onClick={() => {
          setMenuOpen(false);
          showCategory(category);
        }}
        className="py-2 text-left"
      >
        {category}
      </button>
    ))}

    <a
      href="#lipa"
      onClick={() => setMenuOpen(false)}
      className="py-2"
    >
      Lipa Mdogo Mdogo
    </a>

    <a
      href="#products"
      onClick={() => setMenuOpen(false)}
      className="py-2"
    >
      Deals
    </a>

    <a
      href="#about"
      onClick={() => setMenuOpen(false)}
      className="py-2"
    >
      About Us
    </a>

    <a
      href="#contact"
      onClick={() => setMenuOpen(false)}
      className="py-2"
    >
      Contact
    </a>
  </div>
)}
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
                const variants = product.product_variants ?? [];
                const selectedVariant =
                  variants.find(
                    (variant) => variant.id === selectedVariants[product.id]
                  ) ?? variants[0] ?? null;

                const displayPrice = selectedVariant
                  ? selectedVariant.cash_price
                  : product.cash_price;
                const displayAvailability = selectedVariant
                  ? selectedVariant.availability
                  : product.availability;
                const displayStock = selectedVariant
                  ? selectedVariant.stock_quantity
                  : product.stock_quantity;
                const displayLipa = selectedVariant
                  ? selectedVariant.lipa_mdogo_mdogo_available
                  : product.lipa_mdogo_mdogo_available;
                const displayDeposit = selectedVariant
                  ? selectedVariant.deposit_amount
                  : product.deposit_amount;
                const displayDaily = selectedVariant
                  ? selectedVariant.daily_payment
                  : product.daily_payment;
                const displayDays = selectedVariant
                  ? selectedVariant.payment_days
                  : product.payment_days;
                const displayTotal = selectedVariant
                  ? selectedVariant.total_payable
                  : product.total_payable;

                const whatsappText = encodeURIComponent(
                  `Hello Smart Tech, I am interested in ${product.name}${selectedVariant ? ` — ${selectedVariant.variant_name}` : ""}. Please share more information about the cash and Lipa Mdogo Mdogo options.`
                );

                return (
                  <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      {image ? (
                        <button type="button" onClick={() => openProductGallery(product)} className="h-full w-full cursor-zoom-in" aria-label={`Open ${product.name} image gallery`} title="Click to view and zoom">
                          <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        </button>
                      ) : (
                        <div className="grid h-full place-items-center text-5xl">🛍️</div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#0b2947] shadow">
                        {product.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-black text-[#0b2947]">{product.name}</h3>
                      {(product.description || product.specifications) && (
                        <button
                          type="button"
                          onClick={() => setDescriptionProduct(product)}
                          className="mt-3 w-full rounded-xl border-2 border-[#0798ef] px-4 py-2.5 text-sm font-black text-[#0798ef] transition hover:bg-[#0798ef] hover:text-white"
                        >
                          View Product Description
                        </button>
                      )}

                      {variants.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                            Choose Size / Option
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {variants.map((variant) => (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() =>
                                  setSelectedVariants((current) => ({
                                    ...current,
                                    [product.id]: variant.id,
                                  }))
                                }
                                className={`rounded-full border px-3 py-2 text-sm font-black transition ${
                                  selectedVariant?.id === variant.id
                                    ? "border-[#0798ef] bg-[#0798ef] text-white"
                                    : "border-slate-300 bg-white text-slate-700 hover:border-[#0798ef] hover:text-[#0798ef]"
                                }`}
                              >
                                {variant.variant_name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="mt-4 text-xl font-black text-[#0798ef]">
                        KSh {new Intl.NumberFormat("en-KE").format(displayPrice)}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className={displayAvailability === "Available" ? "text-emerald-700" : displayAvailability === "Sold" ? "text-red-700" : "text-amber-700"}>
                          {displayAvailability}
                        </span>
                        {displayAvailability !== "Sold" && (
                          <span className="text-slate-500">• Stock: {displayStock}</span>
                        )}
                      </div>

                      {displayLipa && (
                        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm">
                          <p className="font-black text-emerald-800">Lipa Mdogo Mdogo</p>
                          <div className="mt-2 grid gap-1 text-emerald-700">
                            <p>Deposit: <b>KSh {new Intl.NumberFormat("en-KE").format(displayDeposit ?? 0)}</b></p>
                            <p>Daily: <b>KSh {new Intl.NumberFormat("en-KE").format(displayDaily ?? 0)}/day</b></p>
                            {displayDays !== null && <p>Payment Period: <b>{displayDays} days</b></p>}
                            {displayTotal !== null && <p>Total Payable: <b>KSh {new Intl.NumberFormat("en-KE").format(displayTotal)}</b></p>}
                          </div>
                        </div>
                      )}

                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <a
                          href={`tel:${PHONE_NUMBER}`}
                          className="flex items-center justify-center gap-2 rounded-xl bg-[#0798ef] px-4 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-[#087bd0] hover:shadow-lg active:scale-[.98]"
                        >
                          📞 Call Us
                        </a>
                        <a
                          href={`https://wa.me/254785709176?text=${whatsappText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[.98]"
                        >
                          <FaWhatsapp />
                          Enquire on WhatsApp
                        </a>
                      </div>
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
              <a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-2 transition hover:text-white"><span className="text-lg text-black">📞</span><span>+254 785 709 176</span></a>
              <a href="https://wa.me/254785709176?text=Hello%20Smart%20Tech.%20I%20would%20like%20to%20make%20an%20enquiry." target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-white"><FaWhatsapp className="inline text-lg text-black" /> <span>WhatsApp Us</span></a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`tel:${PHONE_NUMBER}`} aria-label="Call Smart Tech" title="Call Smart Tech" className="grid h-12 w-12 place-items-center rounded-full border border-black/20 bg-white text-xl text-black transition duration-200 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(0,0,0,.25)] active:scale-95">📞</a>
              <a href="https://wa.me/254785709176?text=Hello%20Smart%20Tech.%20I%20would%20like%20to%20make%20an%20enquiry." target="_blank" rel="noopener noreferrer" aria-label="Contact Smart Tech on WhatsApp" title="WhatsApp" className="grid h-12 w-12 place-items-center rounded-full border border-black/20 bg-white text-xl text-black transition duration-200 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(0,0,0,.25)] active:scale-95"><FaWhatsapp /></a>
              <a href="https://www.facebook.com/share/1L7s2XPwM5/" target="_blank" rel="noopener noreferrer" aria-label="Visit Smart Tech on Facebook" title="Facebook" className="grid h-12 w-12 place-items-center rounded-full border border-black/20 bg-white text-xl text-black transition duration-200 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(0,0,0,.25)] active:scale-95"><FaFacebookF /></a>
              <a href="mailto:smarttechbetterliving@gmail.com" aria-label="Email Smart Tech" title="Email" className="grid h-12 w-12 place-items-center rounded-full border border-black/20 bg-white text-xl text-black transition duration-200 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(0,0,0,.25)] active:scale-95"><MdEmail /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/15 px-4 py-5 text-center text-xs text-white/60">© 2026 SMART TECH. All rights reserved. • Smart Products. A Brighter Tomorrow.</div>
      </footer>

      {descriptionProduct && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${descriptionProduct.name} product description`}
          onClick={() => setDescriptionProduct(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDescriptionProduct(null)}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-xl font-black text-slate-700 transition hover:bg-slate-200"
              aria-label="Close product description"
            >
              ✕
            </button>
            <h2 className="pr-14 text-2xl font-black text-[#0b2947] sm:text-3xl">
              {descriptionProduct.name}
            </h2>
            <div className="mt-6 space-y-5">
              {descriptionProduct.description && (
                <div className="rounded-2xl bg-slate-50 p-5 sm:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0798ef]">
                    Product Description
                  </p>
                  <p className="mt-3 whitespace-pre-wrap break-words text-base leading-8 text-slate-700">
                    {descriptionProduct.description}
                  </p>
                </div>
              )}

              {descriptionProduct.specifications && (
                <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5 sm:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0798ef]">
                    Specifications
                  </p>
                  <p className="mt-3 whitespace-pre-wrap break-words text-base leading-8 text-slate-700">
                    {descriptionProduct.specifications}
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setDescriptionProduct(null)}
              className="mt-6 w-full rounded-xl bg-[#0798ef] px-5 py-3.5 font-black text-white transition hover:bg-[#087bd0]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedProduct && selectedProduct.product_images.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`${selectedProduct.name} image gallery`} onClick={closeProductGallery}>
          <div className="relative flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
              <div className="min-w-0"><h2 className="truncate text-lg font-black text-[#0b2947] sm:text-xl">{selectedProduct.name}</h2><p className="text-xs font-semibold text-slate-500">Image {activeImageIndex + 1} of {selectedProduct.product_images.length}</p></div>
              <button type="button" onClick={closeProductGallery} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xl font-black text-slate-700 transition hover:bg-slate-200" aria-label="Close product gallery">✕</button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-950 p-3 sm:p-6">
              <img src={selectedProduct.product_images[activeImageIndex].image_url} alt={`${selectedProduct.name} image ${activeImageIndex + 1}`} className="max-h-[62vh] max-w-full select-none object-contain transition-transform duration-200" style={{ transform: `scale(${imageZoom})`, transformOrigin: "center center", cursor: imageZoom > 1 ? "zoom-out" : "zoom-in" }} onClick={() => setImageZoom((current) => (current > 1 ? 1 : 2))} draggable={false} />
              {selectedProduct.product_images.length > 1 && <>
                <button type="button" onClick={showPreviousProductImage} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl font-black text-[#0b2947] shadow transition hover:bg-white sm:left-5" aria-label="Previous product image">‹</button>
                <button type="button" onClick={showNextProductImage} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl font-black text-[#0b2947] shadow transition hover:bg-white sm:right-5" aria-label="Next product image">›</button>
              </>}
            </div>
            <div className="border-t border-slate-200 bg-white p-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
                  {selectedProduct.product_images.map((productImage, index) => (
                    <button key={`${productImage.image_url}-${index}`} type="button" onClick={() => { setActiveImageIndex(index); setImageZoom(1); }} className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${activeImageIndex === index ? "border-[#0798ef]" : "border-transparent hover:border-slate-300"}`} aria-label={`View image ${index + 1}`}>
                      <img src={productImage.image_url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setImageZoom((current) => Math.max(1, current - 0.5))} disabled={imageZoom <= 1} className="rounded-lg border border-slate-300 px-4 py-2 font-black disabled:cursor-not-allowed disabled:opacity-40" aria-label="Zoom out">−</button>
                  <span className="min-w-16 text-center text-sm font-black text-slate-600">{Math.round(imageZoom * 100)}%</span>
                  <button type="button" onClick={() => setImageZoom((current) => Math.min(3, current + 0.5))} disabled={imageZoom >= 3} className="rounded-lg border border-slate-300 px-4 py-2 font-black disabled:cursor-not-allowed disabled:opacity-40" aria-label="Zoom in">+</button>
                  <button type="button" onClick={() => setImageZoom(1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black">Reset</button>
                  <a href={`https://wa.me/254785709176?text=${encodeURIComponent(`Hello Smart Tech, I am interested in ${selectedProduct.name}. Please share more information about the cash and Lipa Mdogo Mdogo options.`)}`} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-2 rounded-lg bg-black px-4 py-2 font-black text-white"><FaWhatsapp />Enquire</a>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Tap the large image to switch between 100% and 200% zoom. Use the +/− controls for up to 300% zoom.</p>
            </div>
          </div>
        </div>
      )}

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
