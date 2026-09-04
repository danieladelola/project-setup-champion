import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  type LucideIcon,
} from "lucide-react";

import logoAsset from "../assets/logo.png";
import paymentMethodsAsset from "../assets/payment-methods.png.asset.json";

function WhatsApp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.045zm5.879-4.523c-.073-.124-.27-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}

const socials: { label: string; Icon: LucideIcon | typeof WhatsApp; href: string }[] = [
  { label: "Facebook", Icon: Facebook, href: "#" },
  { label: "X", Icon: Twitter, href: "#" },
  { label: "Instagram", Icon: Instagram, href: "#" },
  { label: "WhatsApp", Icon: WhatsApp, href: "https://wa.me/447901910007" },
];

const learnMore = [
  { label: "My Account", to: "/book" },
  { label: "Before & After", to: "/before-and-after" },
  { label: "Help Center", to: "/contact" },
  { label: "Contact us", to: "/contact" },
] as const;

const quickLinks = [
  { label: "Term of services", to: "/about" },
  { label: "Privacy Policy", to: "/about" },
  { label: "Cookie Policy", to: "/about" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-black px-6 pt-20 pb-6 text-on-dark md:px-12 md:pt-24 md:pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand + social */}
          <div className="max-w-xs">
            <Link to="/" aria-label="Mayor Beauty Place home" className="inline-block">
              <img
                src={logoAsset}
                alt="Mayor Beauty Place"
                width={160}
                height={80}
                className="h-14 w-auto object-contain"
                loading="lazy"
              />
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-on-dark/70">
              Our beauty experts understand that each client is unique. They
              take the time to listen, learn about your preferences, and tailor
              their services to enhance your natural beauty.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-brand-red transition-colors hover:bg-brand-red hover:text-on-brand"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Learn More */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-on-dark">
              Learn More
            </h3>
            <ul className="space-y-3 text-sm">
              {learnMore.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-on-dark/70 transition-colors hover:text-brand-red"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-on-dark">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-on-dark/70 transition-colors hover:text-brand-red"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Reach Us */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-on-dark">
              Reach Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                <p className="leading-relaxed text-on-dark/70">
                  110/112 Peckham Rye Lane
                  <br />
                  London, United Kingdom.
                  <br />
                  Post Code: SE15 4RZ
                </p>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand-red" />
                <a
                  href="mailto:info.mayorbeautyplace@gmail.com"
                  className="min-w-0 break-all text-on-dark/70 transition-colors hover:text-brand-red"
                >
                  info.mayorbeautyplace@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand-red" />
                <a
                  href="tel:+447901910007"
                  className="text-on-dark/70 transition-colors hover:text-brand-red"
                >
                  (+44) 7901910007
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand-red" />
                <a
                  href="tel:+442083897978"
                  className="text-on-dark/70 transition-colors hover:text-brand-red"
                >
                  02083897978
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-6 border-t border-on-dark/10 pt-8 md:flex-row md:justify-between">
          <p className="text-center text-xs text-on-dark/50 md:text-left">
            © 2026 Mayor Beauty Place. All rights reserved.
          </p>
          <div className="flex flex-col items-center gap-3 md:items-end">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-dark/40">
              We Accept
            </span>
            <img
              src={paymentMethodsAsset.url}
              alt="Accepted payment methods: Visa, PayPal, Mastercard, Maestro"
              loading="lazy"
              className="h-14 w-auto md:h-16"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
