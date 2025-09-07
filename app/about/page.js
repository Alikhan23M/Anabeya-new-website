// app/about/page.js
export const metadata = {
  title: "About Us | Anabeya Collection",
  description:
    "Learn about Anabeya Collection – a modern fashion brand dedicated to timeless design, premium quality, and empowering self-expression through style.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-primary-light">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            About <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Anabeya Collection</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Where timeless elegance meets modern design — redefining fashion
            with premium quality and effortless sophistication.
          </p>
        </div>

        {/* Story & Mission */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Our Story</h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              Anabeya Collection was born with a vision: to make fashion an
              experience of confidence, not just clothing. What started as a
              passion project has grown into a trusted brand known for quality,
              detail, and timeless style. Every stitch tells a story of care and
              craftsmanship.
            </p>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Our Mission</h2>
            <p className="text-neutral-600 leading-relaxed">
              We are on a mission to empower individuals by offering pieces that
              inspire self-expression. Whether casual, chic, or statement —
              Anabeya is more than fashion, it’s a lifestyle of elegance,
              comfort, and confidence.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src="/images/anabeya.jpg"
              alt="Anabeya Collection clothing showcase"
              className="w-full h-96 object-cover"
            />
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="admin-card text-center">
              <div className="gradient-primary p-3 rounded-lg w-fit mx-auto mb-4">
                <span className="text-white text-xl">✓</span>
              </div>
              <h3 className="font-semibold text-primary-600 mb-2">Quality</h3>
              <p className="text-neutral-600 text-sm">
                Fabrics chosen with care, crafted to last. Every piece is
                designed with precision and premium detail.
              </p>
            </div>
            <div className="admin-card text-center">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-3 rounded-lg w-fit mx-auto mb-4">
                <span className="text-white text-xl">✦</span>
              </div>
              <h3 className="font-semibold text-primary-600 mb-2">Elegance</h3>
              <p className="text-neutral-600 text-sm">
                Our designs balance modern trends with timeless sophistication —
                ensuring effortless style for every occasion.
              </p>
            </div>
            <div className="admin-card text-center">
              <div className="bg-gradient-to-r from-success-600 to-emerald-600 p-3 rounded-lg w-fit mx-auto mb-4">
                <span className="text-white text-xl">♡</span>
              </div>
              <h3 className="font-semibold text-primary-600 mb-2">Trust</h3>
              <p className="text-neutral-600 text-sm">
                We build more than fashion — we build relationships. Our
                customers are at the heart of everything we do.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
            Ready to Experience Anabeya?
          </h3>
          <p className="text-neutral-600 mb-6">
            Discover collections designed to inspire your confidence and elevate
            your wardrobe.
          </p>
          <a href="/products" className="btn-primary">
            Explore Collection
          </a>
        </div>
      </div>
    </div>
  );
}
