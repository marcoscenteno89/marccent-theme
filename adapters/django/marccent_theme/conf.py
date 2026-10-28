"""The MARCCENT setting, with its defaults filled in."""

from django.conf import settings

from . import __version__

DEFAULTS = {
    # Where dist/ comes from: "cdn" (jsDelivr, pinned to VERSION) or "static" (your static files; see README).
    "SOURCE": "cdn",
    "VERSION": __version__,
    "CDN": "https://cdn.jsdelivr.net/gh/marcoscenteno89/marccent-theme@v{version}/dist/",
    "STATIC_PREFIX": "marccent/",
    # The design style the site starts in (styles/themes/<id>), "none" for the plain look, or "all" to load every
    # one (where visitors can switch).
    "DESIGN": "modern",
    "DARK": False,
    # The site's starting theme over the package's (lib/defaults.js): palette, palettes, isDark, design…
    "DEFAULTS": {},
    # Google Fonts families to load, as css2 takes them: ["Geist:wght@400;600", "Fraunces:opsz,wght@9..144,700"].
    "FONTS": [],
    # Every load starts from the defaults, ignoring what a visitor saved (development).
    "DEV": False,
}


def config():
    return {**DEFAULTS, **getattr(settings, "MARCCENT", {})}
