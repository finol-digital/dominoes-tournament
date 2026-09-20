from pathlib import Path
p=Path(__file__).parent
template=(p/'template.html').read_text(encoding='utf-8')
template=template.replace('/* THEME_STYLES */',(p/'hawaii.css').read_text(encoding='utf-8'))
template=template.replace('<!-- ISLAND_ART -->',(p/'island-header.svg').read_text(encoding='utf-8'))
template=template.replace('/* CORE_SCRIPT */',(p/'core.js').read_text(encoding='utf-8'))
template=template.replace('/* APP_SCRIPT */',(p/'app.js').read_text(encoding='utf-8'))
(p/'Domino-Night.html').write_text(template,encoding='utf-8')
print(p/'Domino-Night.html')
