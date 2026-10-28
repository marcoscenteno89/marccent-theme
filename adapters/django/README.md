# Marccent theme for Django

Template tags that load the Marccent theme's prebuilt `dist/` (its styles, design styles and plain-JS engine) at a
pinned version. Your templates render the theme's markup (the same HTML the React components render); the engine
finds it by `data-component` and wires it up.

## Install

```sh
pip install "git+https://github.com/marcoscenteno89/marccent-theme@v0.2.1#subdirectory=adapters/django"
```

```python
INSTALLED_APPS = [ ..., "marccent_theme" ]

MARCCENT = {
    "DESIGN": "swiss",                       # the design style; "all" lets visitors switch, "none" for the plain look
    "FONTS": ["Geist:wght@400;600"],         # Google Fonts families, loaded with a preconnect
    "DEFAULTS": {                            # the site's starting theme (window.marccentDefaults)
        "palette": "brand",
        "isDark": False,
        "palettes": [{"id": "brand", "primary": "#046bd2", "secondary": "#1e293b"}],
    },
}
```

```django
{% load marccent %}
<html lang="en" {% marccent_html_attrs %}>
<head>
  {% marccent_head %}
</head>
```

`marccent_head` is `marccent_fonts`, `marccent_css` and `marccent_js`; use them on their own to place them yourself.

## Where the files come from

By default from jsDelivr, at the version of this package (`v0.2.1`). To serve them yourself, install the npm package
at the same version and collect its `dist/`:

```python
MARCCENT = { ..., "SOURCE": "static" }
STATICFILES_DIRS = [ ("marccent", BASE_DIR / "node_modules/marccent-theme/dist") ]
```

## Settings

| Key | Default | |
| --- | --- | --- |
| `SOURCE` | `"cdn"` | `"cdn"` or `"static"` |
| `VERSION` | this package's | the release the CDN URLs are pinned to |
| `DESIGN` | `"modern"` | a design style id, `"all"` or `"none"` |
| `DARK` | `False` | dark mode on the first paint |
| `DEFAULTS` | `{}` | the site's starting theme over the package's |
| `FONTS` | `[]` | Google Fonts families |
| `DEV` | `False` | every load starts from the defaults (ignores what a visitor saved) |
