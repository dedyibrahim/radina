"""Developer catalog: 55 additional designs. Existing catalog entries are never rewritten."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = {
    "Romantic": (["Rosalia Arch", "Peony Love Letter", "Magnolia Muse", "Rosewood Nocturne", "Sakura Serenade"], ["#fff3f0", "#743d4c", "#b47885", "#edc3cb"], ["rose", "peony", "magnolia", "rose", "sakura"]),
    "Luxury": (["Orchid Royale", "Champagne Correspondence", "Fleur de Palais", "Velours Botanique", "Pearl Blossom"], ["#fbf5e7", "#574334", "#ae8753", "#ead3ae"], ["orchid", "rose", "lily", "peony", "magnolia"]),
    "Minimalist": (["White Cosmos", "Linen Blossom Letter", "Eucalyptus Notes", "Moonstone Magnolia", "Petal Stillness"], ["#f7f7f0", "#364842", "#83978b", "#d5dfd6"], ["cosmos", "jasmine", "fern", "magnolia", "cosmos"]),
    "Traditional": (["Melati Keraton", "Puspa Songket", "Cempaka Pendopo", "Anggrek Batik Malam", "Kamboja Senja"], ["#f5ead1", "#6c3931", "#ae7b45", "#e3c294"], ["jasmine", "peony", "magnolia", "orchid", "lily"]),
    "Garden": (["Daisy Conservatory", "Wildflower Letters", "Fern Botanique", "Rose Garden Twilight", "Meadow Butterfly"], ["#f0f4e8", "#3e563f", "#80936b", "#d3ddb5"], ["cosmos", "jasmine", "fern", "rose", "magnolia"]),
    "Islamic": (["Raudhah Bloom", "Jannah Letters", "Maryam Garden", "Noor Petals", "Firdaus Breeze"], ["#f5f1e4", "#30554f", "#a08c5d", "#dbd3b7"], ["lily", "jasmine", "magnolia", "orchid", "rose"]),
    "Cinematic": (["Moonlit Garden", "Petal Nocturne", "Bloom Premiere", "Velvet Dusk", "Stella Flower"], ["#efeae8", "#453b4b", "#ad879f", "#d9c6d9"], ["magnolia", "rose", "orchid", "peony", "sakura"]),
    "Vintage": (["Rosette Postcard", "Lavender Correspondence", "Camellia Journal", "Butterfly Memoir", "Sakura Keepsake"], ["#f5eddd", "#685544", "#ab8976", "#dfcab4"], ["rose", "cosmos", "peony", "magnolia", "sakura"]),
    "Destination": (["Azure Orchid", "Riviera Blossom Letter", "Tropical Botanique", "Coral Moonrise", "Island Petals"], ["#edf5f2", "#315b60", "#86a7a1", "#c8dfdb"], ["orchid", "magnolia", "fern", "lily", "cosmos"]),
    "Creative": (["Pastel Carnival", "Flower Pop Letter", "Sakura Cloud", "Midnight Fiesta", "Butterfly Confetti"], ["#fff1e6", "#835a77", "#c38b94", "#f0c5b8"], ["cosmos", "peony", "sakura", "orchid", "magnolia"]),
    "Modern": (["Fleur Geometry", "Botanical Signature", "Urban Petal Editorial", "Midnight Orchid", "Bloom Motion"], ["#eff0f2", "#383f58", "#8e94ad", "#d0d8e7"], ["lily", "jasmine", "magnolia", "orchid", "rose"]),
}
FAMILIES = ["arch", "letter", "editorial", "cinema", "carousel"]
MOTIONS = ["sway", "bloom", "breeze", "drift", "flutter"]
EFFECTS = [["petals", "leaves"], ["petals", "ribbons"], ["seeds", "sparkles"], ["fireflies", "sparkles"], ["leaves", "petals"]]
CATEGORY_COPY = ["Semoga kasih tumbuh dalam setiap doa yang menyertai.", "Sebuah perayaan hangat untuk orang-orang yang berarti.", "Dalam kesederhanaan, kami menemukan kebahagiaan yang utuh.", "Restu keluarga menemani langkah dan tradisi kami.", "Kebahagiaan bersemi ketika kita berkumpul bersama.", "Dengan memohon rida Allah, kami mengundang kehadiran Anda.", "Setiap kenangan membawa kami menuju bab yang baru.", "Kehangatan kenangan menjadi awal cerita hari ini.", "Dari berbagai tempat, kita bertemu untuk berbagi kebahagiaan.", "Mari rayakan hari istimewa dengan warna dan tawa.", "Sebuah langkah baru, sebuah waktu untuk berkumpul."]
FAMILY_COPY = ["Dengan sepenuh hati, kami berbagi kabar bahagia ini.", "Melalui undangan kecil ini, kami menitipkan harapan yang besar.", "Kehadiran Anda melengkapi cerita yang ingin kami kenang.", "Kami menantikan sebuah hari yang akan selalu tinggal di hati.", "Ada begitu banyak kebahagiaan yang ingin kami bagikan kepada Anda."]
BRIDES = "Adelia Anindita Arunika Ashanty Auliana Ayunita Belvina Binar Cempaka Dahayu Danastri Dania Delisha Diajeng Elvina Emira Fadhila Fathia Febriana Gayatri Ghina Hapsari Hilya Indira Intania Isyana Jelita Jesika Kanaya Kartika Kinasih Kirania Laksita Lathifa Maharani Maulida Melati Mentari Naura Nindita Nisrina Paramita Pramesti Puspa Rahayu Raline Ranita Ratih Ravina Renata Reswara Safira Sandrina Savira Sekarini".split()
GROOMS = "Aditya Mahendra Pradipta Naufal Gibran Hanif Satya Narendra Pranata Yudhistira".split()

def read(name): return json.loads((ROOT / 'config' / name).read_text(encoding='utf-8'))
def write(name, value): (ROOT / 'config' / name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

existing = read('template-presets.json')
old_demos = read('additional-template-demos.json')
used_names = {d['bride'] for d in old_demos} | {'Alya','Salsabila','Nadia','Sekar','Amara','Clara','Keisha','Aisyah','Nara','Celine'}
photos = sorted(int(p.stem.split('-')[-1]) for p in (ROOT/'frontend/public/images/demos').glob('photo-*.webp'))
collection, presets, demos = {}, {}, []
for c, (category, (names, colors, flowers)) in enumerate(CATEGORIES.items()):
    for i, name in enumerate(names):
        index = c * 5 + i
        key = re.sub('[^a-z0-9]+','-',name.lower()).strip('-')
        assert key not in existing, key
        folder = ''.join(name.split())
        family = FAMILIES[i]
        background, ink, accent, highlight = colors
        if i == 3:
            background, ink = ['#2d202a','#252c30','#27302d','#32242b','#233327','#19332f','#211e2e','#382d34','#213941','#32273c','#242a3c'][c], '#faf0e4'
        photo = photos[(index * 3 + i) % len(photos)]
        collection[key] = dict(name=name,category=category,family=family,flower=flowers[i],corner_motion=MOTIONS[i],motif=['botanical','pearl','grid','halo','butterfly'][i],variant=index,hero_photo=photo,palette=dict(background=background,ink=ink,accent=accent,highlight=highlight,flower=['#ca8695','#e5aa9c','#c1b4d4','#c686a4','#ceb775'][c%5],leaf=['#71917a','#869380','#6e958c'][c%3]),motion=EFFECTS[i] if category!='Creative' else [['petals','confetti'],['ribbons','paper'],['leaves','sparkles'],['confetti','balloons'],['leaves','confetti']][i])
        headings={'home':'Hari Istimewa Kami','couple':'Yang Berbahagia','quote':'Doa & Harapan','story':'Cerita Perjalanan','event':'Waktu & Tempat','gallery':'Bingkai Kenangan','gift':'Tanda Kasih','rsvp':'Konfirmasi Kehadiran','wishes':'Ucapan & Doa','closing':'Terima Kasih'}
        order=['home','couple','quote','date','event','story','gallery','video','location','rsvp','wishes','gift','livestream','closing']
        if family=='editorial': order=['home','event','couple','date','quote','gallery','story','video','location','rsvp','wishes','gift','livestream','closing']
        if family=='cinema': order=['home','story','couple','quote','event','date','gallery','video','location','rsvp','wishes','gift','livestream','closing']
        quote='Di antara tanda kebesaran-Nya, Dia menciptakan pasangan untukmu agar kamu merasa tenteram.' if category=='Islamic' else 'Setiap pertemuan yang tulus menyimpan sebuah cerita yang layak dirayakan.'
        preset=dict(name=name,opening_text=FAMILY_COPY[i]+' '+CATEGORY_COPY[c],order=order,mood=['Islamic' if category=='Islamic' else 'Romantic','Instrumental'],sections={k:dict(enabled=True,heading=v,subheading='',content='') for k,v in headings.items()},quote=quote,quote_source='Makna QS. Ar-Rum: 21' if category=='Islamic' else 'Harapan kami',closing_text='Terima kasih atas kehadiran dan doa Anda. Semoga kebahagiaan ini menjadi kenangan yang hangat.',gallery_style=family,category=category,motion=collection[key]['motion'],studio=True,collection='floral-atelier')
        presets[key]=preset
        bride=BRIDES[index];bride=bride+' Putri' if bride in used_names else bride;used_names.add(bride)
        groom=GROOMS[index%len(GROOMS)]
        demos.append(dict(key=key,folder=folder,name=name,category=category,bride=bride,groom=groom,quote=CATEGORY_COPY[c],venue='Paviliun '+name,hero_photo=photo,story=[dict(title=t,text=text) for t,text in [('Awal Pertemuan',f'{bride} dan {groom} saling mengenal dalam sebuah pertemuan sederhana.'),('Tumbuh Bersama',f'Cerita dan waktu mempertemukan langkah {bride} dan {groom}.'),('Restu Keluarga','Doa keluarga menemani niat baik yang mereka jaga bersama.'),('Hari yang Dinanti','Kini mereka mengundang Anda untuk menjadi bagian dari sebuah awal yang baru.')]]))
assert len(collection)==55
assert all(effect in read('motion-effects.json') for design in collection.values() for effect in design['motion'])
assert len({p['opening_text'] for p in presets.values()})==55
write('floral-collection.json',collection)
write('floral-presets.json',presets)
write('floral-demos.json',demos)
path=ROOT/'app/Services/TemplateCatalog.php'
source=path.read_text(encoding='utf-8')
for label, additions in [('KEYS',list(collection)),('COMPONENTS',[d['folder']+'.vue' for d in demos])]:
    pattern=r'(public const '+label+r' = \[)(.*?)(\];)'
    def append(match):
        body=match.group(2)
        for entry in additions:
            if "'"+entry+"'" not in body: body+=", '"+entry+"'"
        return match.group(1)+body+match.group(3)
    source,count=re.subn(pattern,append,source,flags=re.S)
    assert count==1,label
path.write_text(source,encoding='utf-8')
print('Generated 55 additional designs in 11 existing categories. Existing presets and demos untouched.')
