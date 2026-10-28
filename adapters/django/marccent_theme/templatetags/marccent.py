"""
{% load marccent %}, then in the base template:

    <html lang="en" {% marccent_html_attrs %}>
    <head>… {% marccent_head %} </head>

marccent_head is marccent_fonts + marccent_css + marccent_js. Each can be used on its own.
"""

import json

from django import template
from django.templatetags.static import static
from django.utils.html import format_html, format_html_join
from django.utils.safestring import mark_safe

from ..conf import config

register = template.Library()


def _url(path):
    """A file of dist/, from the CDN at the pinned version or from your static files."""
    c = config()
    if c["SOURCE"] == "static":
        return static(c["STATIC_PREFIX"] + path)
    return c["CDN"].format(version=c["VERSION"]) + path


def _script_json(value):
    """JSON safe to put inside a <script>: no way to close the tag or start a comment."""
    return json.dumps(value).replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")


@register.simple_tag
def marccent_html_attrs():
    """The theme's first paint on <html>: the design style and the mode, before any script runs."""
    c = config()
    design = c["DEFAULTS"].get("design", c["DESIGN"])
    dark = c["DEFAULTS"].get("isDark", c["DARK"])
    if design == "all":
        design = "modern"
    return format_html('data-design="{}" data-theme="{}"', design, "dark" if dark else "light")


@register.simple_tag
def marccent_fonts():
    """Preconnect and one stylesheet for the FONTS setting's Google Fonts families."""
    families = config()["FONTS"]
    if not families:
        return mark_safe("")
    query = "&".join("family=" + f.replace(" ", "+") for f in families)
    return format_html(
        '<link rel="preconnect" href="https://fonts.googleapis.com">'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{}&display=swap">',
        mark_safe(query.replace('"', "%22")),
    )


@register.simple_tag
def marccent_css(design=None):
    """dist/marccent.css, then the design style (DESIGN, or the one given; "all" for every one, "none" for none)."""
    c = config()
    design = design or c["DEFAULTS"].get("design", c["DESIGN"])
    files = ["marccent.css"]
    if design == "all":
        files.append("designs.css")
    elif design and design != "none":
        files.append(f"designs/{design}.css")
    return format_html_join("", '<link rel="stylesheet" href="{}">', ((_url(f),) for f in files))


@register.simple_tag
def marccent_js():
    """The site's starting theme (window.marccentDefaults) and dist/marccent.js, which starts by itself."""
    c = config()
    setup = f"window.marccentDefaults = {_script_json(c['DEFAULTS'])};"
    if c["DEV"]:
        setup += " window.marccentDev = true;"
    return format_html('<script>{}</script><script type="module" src="{}"></script>', mark_safe(setup), _url("marccent.js"))


@register.simple_tag
def marccent_head(design=None):
    """Everything the head needs: fonts, styles, the starting theme and the script."""
    return marccent_fonts() + marccent_css(design) + marccent_js()
